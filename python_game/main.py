import pygame
import sys
import random
import os

WIDTH, HEIGHT = 540, 800
FPS = 60

class Prize:
    def __init__(self, x, y, image, prize_type):
        self.image = image
        self.rect = self.image.get_rect(center=(x, y))
        self.prize_type = prize_type
        self.grabbed = False
        self.collected = False

    def draw(self, surf):
        if not self.collected:
            surf.blit(self.image, self.rect)

class Claw:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.home_x = x
        self.home_y = y
        self.state = 'idle'  # idle, dropping, grabbing, lifting, returning, delivering, resetting
        self.speed_h = 180
        self.speed_v = 220
        self.grabbed_prize = None
        self.target_y = 0

    def draw(self, surf):
        # Rope
        pygame.draw.line(surf, (80,80,80), (int(self.x), 40), (int(self.x), int(self.y)), 3)
        # Claw body - simple triangle claw
        claw_size = 28
        # Outer shell (golden)
        pygame.draw.polygon(surf, (220,180,50), [
            (self.x, self.y),
            (self.x - claw_size, self.y + claw_size),
            (self.x + claw_size, self.y + claw_size)
        ])
        # Inner shadow
        pygame.draw.polygon(surf, (180,140,30), [
            (self.x, self.y + 8),
            (self.x - claw_size*0.7, self.y + claw_size*0.8),
            (self.x + claw_size*0.7, self.y + claw_size*0.8)
        ])
        # Claw details
        pygame.draw.line(surf, (100,80,20), (self.x - claw_size, int(self.y + claw_size)), (int(self.x), int(self.y)), 4)
        pygame.draw.line(surf, (100,80,20), (self.x + claw_size, int(self.y + claw_size)), (int(self.x), int(self.y)), 4)
    
    def get_grab_rect(self):
        """Get the collision rectangle for grabbing"""
        # Wider and taller collision area
        return pygame.Rect(self.x - 35, self.y + 10, 70, 45)

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    pygame.display.set_caption('Claw Machine Game')

    font = pygame.font.SysFont(None, 32)
    font_small = pygame.font.SysFont(None, 24)

    # Load prize images
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets', 'generated')
    prize_images = {}
    prize_types = ['bunny', 'teddy', 'striped', 'cat']
    
    for ptype in prize_types:
        path = os.path.join(assets_dir, f'prize_{ptype}.png')
        if os.path.exists(path):
            img = pygame.image.load(path)
            # Scale down to reasonable size
            prize_images[ptype] = pygame.transform.scale(img, (56, 56))
        else:
            # Fallback placeholder if image doesn't exist
            surf = pygame.Surface((56, 56), pygame.SRCALPHA)
            colors = {'bunny': (255,200,220), 'teddy': (200,140,80), 'striped': (240,240,240), 'cat': (255,255,255)}
            pygame.draw.circle(surf, colors.get(ptype, (200,200,200)), (28,28), 24)
            prize_images[ptype] = surf

    # Create prize pile - more spread out placement
    prizes = []
    grid_positions = [
        (120, 520), (220, 520), (320, 520), (420, 520),
        (120, 600), (220, 600), (320, 600), (420, 600),
        (170, 560), (270, 560), (370, 560),
        (120, 680), (270, 680), (420, 680)
    ]
    for pos in grid_positions:
        ptype = random.choice(prize_types)
        prizes.append(Prize(pos[0], pos[1], prize_images[ptype], ptype))

    # Claw
    claw = Claw(WIDTH // 2, 80)

    # Game state
    score = 0
    instructions = "Press A/D or LEFT/RIGHT to move, SPACE to drop and grab"
    message = ""
    message_timer = 0

    running = True
    while running:
        dt = clock.tick(FPS) / 1000.0
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and claw.state == 'idle':
                    claw.state = 'dropping'
                    claw.target_y = 680
                    message = ""

        keys = pygame.key.get_pressed()
        
        # Claw horizontal movement (only in idle state)
        if claw.state == 'idle':
            if keys[pygame.K_LEFT] or keys[pygame.K_a]:
                claw.x -= claw.speed_h * dt
                claw.x = max(80, claw.x)
            if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
                claw.x += claw.speed_h * dt
                claw.x = min(WIDTH - 80, claw.x)

        # Claw state machine
        if claw.state == 'dropping':
            claw.y += claw.speed_v * dt
            if claw.y >= claw.target_y:
                claw.y = claw.target_y
                claw.state = 'grabbing'
                # Check grab collision
                grab_rect = claw.get_grab_rect()
                grabbed = False
                for prize in prizes:
                    if not prize.collected and grab_rect.colliderect(prize.rect):
                        # 70% success rate
                        if random.random() < 0.7:
                            claw.grabbed_prize = prize
                            prize.grabbed = True
                            grabbed = True
                            message = "Caught one!"
                            break
                if not grabbed:
                    message = "Missed..."
                message_timer = 2.0

        elif claw.state == 'grabbing':
            # Brief pause
            claw.state = 'lifting'

        elif claw.state == 'lifting':
            claw.y -= claw.speed_v * dt
            if claw.grabbed_prize:
                claw.grabbed_prize.rect.center = (claw.x, claw.y + 40)
                # Chance to drop mid-lift
                if claw.y < 400 and random.random() < 0.002:  # Very small chance per frame
                    claw.grabbed_prize.grabbed = False
                    claw.grabbed_prize = None
                    message = "Dropped it!"
                    message_timer = 1.5
            if claw.y <= 100:
                claw.y = 100
                claw.state = 'returning'

        elif claw.state == 'returning':
            # Move to exit (top right)
            target_x = WIDTH - 80
            dx = target_x - claw.x
            if abs(dx) > 2:
                claw.x += (dx / abs(dx)) * claw.speed_h * dt
                if claw.grabbed_prize:
                    claw.grabbed_prize.rect.center = (claw.x, claw.y + 40)
            else:
                claw.x = target_x
                claw.state = 'delivering'

        elif claw.state == 'delivering':
            # Drop prize at exit
            if claw.grabbed_prize:
                claw.grabbed_prize.collected = True
                score += 1
                message = f"Success! Score: {score}"
                message_timer = 2.0
                claw.grabbed_prize = None
            # Return to home
            claw.state = 'resetting'

        elif claw.state == 'resetting':
            # Return to home position
            dx = claw.home_x - claw.x
            dy = claw.home_y - claw.y
            if abs(dx) > 2:
                claw.x += (dx / abs(dx)) * claw.speed_h * dt
            else:
                claw.x = claw.home_x
            if abs(dy) > 2:
                claw.y += (dy / abs(dy)) * claw.speed_v * dt
            else:
                claw.y = claw.home_y
                claw.state = 'idle'

        # Message timer
        if message_timer > 0:
            message_timer -= dt

        # Drawing
        screen.fill((255, 220, 200))
        
        # Machine frame/background
        pygame.draw.rect(screen, (100, 60, 40), (0, 0, WIDTH, 80))  # Top
        pygame.draw.rect(screen, (80, 50, 30), (0, 0, 50, HEIGHT))   # Left frame
        pygame.draw.rect(screen, (80, 50, 30), (WIDTH-50, 0, 50, HEIGHT))  # Right frame
        pygame.draw.rect(screen, (120, 80, 50), (0, HEIGHT-100, WIDTH, 100))  # Bottom
        
        # Play area background
        pygame.draw.rect(screen, (180, 230, 255), (60, 90, WIDTH-120, HEIGHT-190))
        
        # Prize area floor
        pygame.draw.rect(screen, (150, 120, 80), (60, 480, WIDTH-120, 220))
        
        # Exit area (top right)
        pygame.draw.rect(screen, (50, 200, 50), (WIDTH-130, 120, 70, 60))
        exit_text = font_small.render('EXIT', True, (255,255,255))
        screen.blit(exit_text, (WIDTH-120, 135))

        # Draw prizes
        for prize in prizes:
            prize.draw(screen)

        # Draw claw
        claw.draw(screen)
        
        # Debug: draw grab collision rect (optional - comment out in production)
        # if claw.state == 'grabbing':
        #     pygame.draw.rect(screen, (255,0,0), claw.get_grab_rect(), 2)

        # HUD
        score_text = font.render(f'Score: {score}', True, (255,255,255))
        screen.blit(score_text, (10, 10))
        
        inst_text = font_small.render(instructions, True, (255,255,255))
        screen.blit(inst_text, (10, 45))

        if message and message_timer > 0:
            msg_surf = font.render(message, True, (255, 50, 50))
            screen.blit(msg_surf, (WIDTH//2 - msg_surf.get_width()//2, HEIGHT//2))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == '__main__':
    main()
