import pygame

def draw_bunny(surface, center, size):
    """White bunny with blue striped overalls, holding carrot"""
    cx, cy = center
    
    # Body (white oval)
    body_color = (255, 255, 255)
    pygame.draw.ellipse(surface, body_color, (cx-size*0.3, cy-size*0.1, size*0.6, size*0.55))
    
    # Head (white circle)
    pygame.draw.circle(surface, body_color, (cx, cy-size*0.3), int(size*0.28))
    
    # Long ears
    pygame.draw.ellipse(surface, body_color, (cx-size*0.22, cy-size*0.68, size*0.15, size*0.42))
    pygame.draw.ellipse(surface, body_color, (cx+size*0.07, cy-size*0.68, size*0.15, size*0.42))
    
    # Blue striped overalls
    overall_blue = (100, 180, 255)
    pygame.draw.rect(surface, overall_blue, (cx-size*0.25, cy-size*0.05, size*0.5, size*0.4))
    
    # Vertical stripes
    for i in range(6):
        x = cx - size*0.25 + i*size*0.1
        pygame.draw.line(surface, (70, 140, 220), (int(x), int(cy-size*0.05)), (int(x), int(cy+size*0.35)), 2)
    
    # Straps
    pygame.draw.line(surface, (70, 140, 220), (cx-size*0.15, cy-size*0.05), (cx-size*0.2, cy+size*0.25), 4)
    pygame.draw.line(surface, (70, 140, 220), (cx+size*0.15, cy-size*0.05), (cx+size*0.2, cy+size*0.25), 4)
    
    # Pocket
    pygame.draw.rect(surface, (120, 200, 255), (cx-size*0.08, cy+size*0.05, size*0.16, size*0.12))
    
    # Eyes
    pygame.draw.circle(surface, (0,0,0), (cx-int(size*0.09), cy-int(size*0.32)), int(size*0.045))
    pygame.draw.circle(surface, (0,0,0), (cx+int(size*0.09), cy-int(size*0.32)), int(size*0.045))
    
    # Heart nose
    nose_color = (255, 50, 80)
    pygame.draw.circle(surface, nose_color, (cx, cy-int(size*0.26)), int(size*0.05))
    
    # Smile
    pygame.draw.arc(surface, (0,0,0), (cx-size*0.08, cy-size*0.28, size*0.16, size*0.08), 3.14, 6.28, 2)
    
    # Carrot (held on right side)
    carrot_x = cx + int(size*0.35)
    carrot_y = cy + int(size*0.1)
    pygame.draw.polygon(surface, (255,140,50), [
        (carrot_x, carrot_y),
        (carrot_x - 8, carrot_y + 18),
        (carrot_x + 8, carrot_y + 18)
    ])
    # Carrot leaves
    pygame.draw.polygon(surface, (80,180,80), [
        (carrot_x-3, carrot_y-5),
        (carrot_x, carrot_y),
        (carrot_x+3, carrot_y-5)
    ])

def draw_teddy(surface, center, size):
    """Brown teddy bear with red overalls"""
    cx, cy = center
    bear_color = (210, 160, 110)
    
    # Body
    pygame.draw.ellipse(surface, bear_color, (cx-size*0.32, cy-size*0.08, size*0.64, size*0.58))
    
    # Head
    pygame.draw.circle(surface, bear_color, (cx, cy-size*0.32), int(size*0.26))
    
    # Ears
    pygame.draw.circle(surface, bear_color, (int(cx-size*0.22), int(cy-size*0.5)), int(size*0.09))
    pygame.draw.circle(surface, bear_color, (int(cx+size*0.22), int(cy-size*0.5)), int(size*0.09))
    
    # Inner ears
    pygame.draw.circle(surface, (255,200,150), (int(cx-size*0.22), int(cy-size*0.5)), int(size*0.05))
    pygame.draw.circle(surface, (255,200,150), (int(cx+size*0.22), int(cy-size*0.5)), int(size*0.05))
    
    # Red overalls
    pygame.draw.rect(surface, (240,60,60), (cx-size*0.28, cy-size*0.02, size*0.56, size*0.42))
    
    # Straps
    pygame.draw.line(surface, (200,40,40), (cx-size*0.16, cy-size*0.02), (cx-size*0.22, cy+size*0.3), 5)
    pygame.draw.line(surface, (200,40,40), (cx+size*0.16, cy-size*0.02), (cx+size*0.22, cy+size*0.3), 5)
    
    # Buttons
    pygame.draw.circle(surface, (255,200,80), (int(cx-size*0.18), int(cy)), int(size*0.04))
    pygame.draw.circle(surface, (255,200,80), (int(cx+size*0.18), int(cy)), int(size*0.04))
    
    # Belly patch
    pygame.draw.ellipse(surface, (255,220,180), (cx-size*0.14, cy+size*0.05, size*0.28, size*0.22))
    
    # Eyes
    pygame.draw.circle(surface, (0,0,0), (cx-int(size*0.08), cy-int(size*0.34)), int(size*0.045))
    pygame.draw.circle(surface, (0,0,0), (cx+int(size*0.08), cy-int(size*0.34)), int(size*0.045))
    
    # Nose
    pygame.draw.circle(surface, (80,50,30), (cx, cy-int(size*0.26)), int(size*0.05))
    
    # Smile
    pygame.draw.arc(surface, (0,0,0), (cx-size*0.1, cy-size*0.3, size*0.2, size*0.1), 3.14, 6.28, 2)

def draw_striped_doll(surface, center, size):
    """White doll with black horizontal stripes"""
    cx, cy = center
    
    # Body (white oval)
    pygame.draw.ellipse(surface, (250,245,240), (cx-size*0.28, cy-size*0.05, size*0.56, size*0.55))
    
    # Black horizontal stripes
    for i in range(6):
        y = cy - size*0.02 + i*size*0.09
        pygame.draw.ellipse(surface, (40,40,40), (cx-size*0.28, y, size*0.56, size*0.06))
    
    # Head (white circle)
    pygame.draw.circle(surface, (255,255,255), (cx, cy-size*0.32), int(size*0.26))
    
    # Blush/cheeks
    pygame.draw.circle(surface, (255,200,200), (cx-int(size*0.18), cy-int(size*0.28)), int(size*0.06))
    pygame.draw.circle(surface, (255,200,200), (cx+int(size*0.18), cy-int(size*0.28)), int(size*0.06))
    
    # Eyes
    pygame.draw.circle(surface, (0,0,0), (cx-int(size*0.08), cy-int(size*0.33)), int(size*0.04))
    pygame.draw.circle(surface, (0,0,0), (cx+int(size*0.08), cy-int(size*0.33)), int(size*0.04))
    
    # Smile
    pygame.draw.arc(surface, (0,0,0), (cx-size*0.09, cy-size*0.28, size*0.18, size*0.1), 3.14, 6.28, 2)
    
    # Arms
    pygame.draw.ellipse(surface, (240,235,230), (cx-size*0.4, cy+size*0.05, size*0.15, size*0.3))
    pygame.draw.ellipse(surface, (240,235,230), (cx+size*0.25, cy+size*0.05, size*0.15, size*0.3))

def draw_cat(surface, center, size):
    """White cat lying down"""
    cx, cy = center
    cat_color = (255, 255, 255)
    
    # Body (horizontal oval - lying down)
    pygame.draw.ellipse(surface, cat_color, (cx-size*0.35, cy-size*0.05, size*0.7, size*0.45))
    
    # Head (circle on left)
    head_x = cx - size*0.18
    head_y = cy - size*0.12
    pygame.draw.circle(surface, cat_color, (int(head_x), int(head_y)), int(size*0.22))
    
    # Ears (triangles)
    ear_size = int(size*0.15)
    # Left ear
    pygame.draw.polygon(surface, cat_color, [
        (head_x - ear_size*0.6, head_y - size*0.22),
        (head_x - ear_size*0.2, head_y - size*0.08),
        (head_x, head_y - size*0.22)
    ])
    # Right ear
    pygame.draw.polygon(surface, cat_color, [
        (head_x, head_y - size*0.22),
        (head_x + ear_size*0.2, head_y - size*0.08),
        (head_x + ear_size*0.6, head_y - size*0.22)
    ])
    
    # Inner ears (pink)
    pygame.draw.polygon(surface, (255,200,220), [
        (head_x - ear_size*0.5, head_y - size*0.20),
        (head_x - ear_size*0.3, head_y - size*0.12),
        (head_x - ear_size*0.1, head_y - size*0.20)
    ])
    pygame.draw.polygon(surface, (255,200,220), [
        (head_x + ear_size*0.1, head_y - size*0.20),
        (head_x + ear_size*0.3, head_y - size*0.12),
        (head_x + ear_size*0.5, head_y - size*0.20)
    ])
    
    # Eyes
    pygame.draw.circle(surface, (0,0,0), (int(head_x - size*0.07), int(head_y - size*0.05)), int(size*0.04))
    pygame.draw.circle(surface, (0,0,0), (int(head_x + size*0.07), int(head_y - size*0.05)), int(size*0.04))
    
    # Nose (small triangle)
    pygame.draw.polygon(surface, (50,50,50), [
        (head_x, head_y + size*0.02),
        (head_x - size*0.025, head_y + size*0.05),
        (head_x + size*0.025, head_y + size*0.05)
    ])
    
    # Whiskers
    whisker_color = (100,100,100)
    pygame.draw.line(surface, whisker_color, (int(head_x - size*0.15), int(head_y)), (int(head_x - size*0.3), int(head_y - size*0.02)), 1)
    pygame.draw.line(surface, whisker_color, (int(head_x - size*0.15), int(head_y + size*0.03)), (int(head_x - size*0.3), int(head_y + size*0.05)), 1)
    pygame.draw.line(surface, whisker_color, (int(head_x + size*0.15), int(head_y)), (int(head_x + size*0.3), int(head_y - size*0.02)), 1)
    pygame.draw.line(surface, whisker_color, (int(head_x + size*0.15), int(head_y + size*0.03)), (int(head_x + size*0.3), int(head_y + size*0.05)), 1)
    
    # Smile/mouth
    pygame.draw.arc(surface, (0,0,0), (head_x - size*0.06, head_y + size*0.04, size*0.12, size*0.06), 3.14, 6.28, 2)
    
    # Tail (curved, on right side)
    tail_start_x = cx + size*0.32
    tail_start_y = cy + size*0.1
    pygame.draw.arc(surface, cat_color, (tail_start_x - size*0.15, tail_start_y - size*0.25, size*0.3, size*0.4), 0, 1.57, int(size*0.12))
    
    # Paws (small ovals)
    pygame.draw.ellipse(surface, (245,245,245), (cx - size*0.28, cy + size*0.25, size*0.12, size*0.08))
    pygame.draw.ellipse(surface, (245,245,245), (cx + size*0.16, cy + size*0.25, size*0.12, size*0.08))
