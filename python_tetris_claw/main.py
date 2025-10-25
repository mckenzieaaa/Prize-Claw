#!/usr/bin/env python3
"""
Tetris Claw - Python/Pygame Version
A claw machine game with Tetris blocks
"""

import pygame
import random
import sys
import math
from enum import Enum
from dataclasses import dataclass
from typing import List, Tuple, Optional

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 800
BLOCK_SIZE = 40
GRID_WIDTH = 10
GRID_HEIGHT = 14
GRID_OFFSET_X = 50  # 左边留50px边距
GRID_OFFSET_Y = 80  # 顶部HUD区域
FPS = 60

# EXIT box in bottom right corner of entire screen
EXIT_BOX_WIDTH = 160
EXIT_BOX_HEIGHT = 120
EXIT_BOX_X = SCREEN_WIDTH - EXIT_BOX_WIDTH - 30
EXIT_BOX_Y = SCREEN_HEIGHT - EXIT_BOX_HEIGHT - 40

# Colors - Morandi Color Palette (柔和、低饱和度)
BLACK = (10, 10, 15)
WHITE = (245, 245, 240)
MORANDI_BLUE = (142, 171, 184)      # 莫兰迪蓝
MORANDI_PINK = (216, 166, 166)      # 莫兰迪粉
MORANDI_GREEN = (162, 180, 155)     # 莫兰迪绿
MORANDI_PURPLE = (175, 159, 180)    # 莫兰迪紫
MORANDI_YELLOW = (221, 202, 158)    # 莫兰迪黄
MORANDI_ORANGE = (213, 166, 135)    # 莫兰迪橙
MORANDI_GRAY = (180, 180, 175)      # 莫兰迪灰
DARK_BG = (52, 55, 60)              # 深色背景
DARKER_BG = (40, 43, 48)            # 更深背景
GRID_COLOR = (80, 85, 90)           # 网格色
HUD_BG = (60, 63, 68)               # HUD背景

# Tetromino shapes with Morandi colors
SHAPES = {
    'I': {'blocks': [(0, 0), (1, 0), (2, 0), (3, 0)], 'color': MORANDI_BLUE},
    'O': {'blocks': [(0, 0), (1, 0), (0, 1), (1, 1)], 'color': MORANDI_YELLOW},
    'T': {'blocks': [(1, 0), (0, 1), (1, 1), (2, 1)], 'color': MORANDI_PURPLE},
    'S': {'blocks': [(1, 0), (2, 0), (0, 1), (1, 1)], 'color': MORANDI_GREEN},
    'Z': {'blocks': [(0, 0), (1, 0), (1, 1), (2, 1)], 'color': MORANDI_PINK},
    'J': {'blocks': [(0, 0), (0, 1), (1, 1), (2, 1)], 'color': (130, 160, 175)},  # 浅莫兰迪蓝
    'L': {'blocks': [(2, 0), (0, 1), (1, 1), (2, 1)], 'color': MORANDI_ORANGE}
}


class GameMode(Enum):
    MENU = "menu"
    MODE_SELECT = "mode_select"
    ENDLESS = "endless"
    TIME_ATTACK = "time_attack"
    LEVELS = "levels"
    VS_MODE = "vs_mode"
    PAUSE = "pause"
    GAME_OVER = "game_over"
    LEVEL_COMPLETE = "level_complete"


@dataclass
class Tetromino:
    x: float
    y: float
    shape_key: str
    blocks: List[Tuple[int, int]]
    color: Tuple[int, int, int]
    grid_positions: List[Tuple[int, int]]


@dataclass
class Particle:
    """粒子类 - 用于烟花和破碎效果"""
    x: float
    y: float
    vx: float  # x方向速度
    vy: float  # y方向速度
    color: Tuple[int, int, int]
    lifetime: int  # 生命周期（帧数）
    size: int
    particle_type: str  # 'firework' 或 'debris'


def draw_glow_rect(surface, color, rect, glow_size=3, border_radius=5):
    """Draw a rectangle with subtle glow effect"""
    # Minimal glow layers - more subtle and refined
    for i in range(glow_size, 0, -1):
        alpha = int(40 * (1 - i / glow_size))
        glow_color = (*color, alpha)
        glow_rect = pygame.Rect(
            rect.x - i, rect.y - i,
            rect.width + i * 2, rect.height + i * 2
        )
        glow_surf = pygame.Surface((glow_rect.width, glow_rect.height), pygame.SRCALPHA)
        pygame.draw.rect(glow_surf, glow_color, glow_surf.get_rect(), border_radius=border_radius + i)
        surface.blit(glow_surf, glow_rect.topleft)
    
    # Draw main rectangle
    pygame.draw.rect(surface, color, rect, border_radius=border_radius)


def draw_gradient_bg(surface, color1, color2):
    """Draw vertical gradient background"""
    for y in range(surface.get_height()):
        ratio = y / surface.get_height()
        color = (
            int(color1[0] * (1 - ratio) + color2[0] * ratio),
            int(color1[1] * (1 - ratio) + color2[1] * ratio),
            int(color1[2] * (1 - ratio) + color2[2] * ratio)
        )
        pygame.draw.line(surface, color, (0, y), (surface.get_width(), y))


class Claw:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        self.target_x = x
        self.target_y = y
        self.speed = 5
        self.auto_moving = False
        self.state = 'idle'  # idle, lifting, moving_horizontal, releasing, returning
        self.delivery_stage = 0  # 0: not delivering, 1: lift to top, 2: move to exit, 3: release, 4: piece falling
        
    def move_to(self, x: float, y: float):
        self.target_x = x
        self.target_y = y
        
    def update(self):
        dx = self.target_x - self.x
        dy = self.target_y - self.y
        distance = (dx**2 + dy**2) ** 0.5
        
        if distance > self.speed:
            self.x += (dx / distance) * self.speed
            self.y += (dy / distance) * self.speed
        elif distance > 0.5:
            self.x += dx * 0.2
            self.y += dy * 0.2
        else:
            self.x = self.target_x
            self.y = self.target_y
            return True  # Reached target
        return False
    
    def draw(self, screen: pygame.Surface):
        # 优雅的绳索 - 莫兰迪蓝色系
        rope_color = MORANDI_BLUE
        rope_shadow = tuple(max(0, c - 40) for c in rope_color)
        
        # 绳索阴影效果
        pygame.draw.line(screen, rope_shadow,
                        (int(self.x + 2), GRID_OFFSET_Y), 
                        (int(self.x + 2), int(self.y - 18)), 5)
        # 主绳索
        pygame.draw.line(screen, rope_color, 
                        (int(self.x), GRID_OFFSET_Y), 
                        (int(self.x), int(self.y - 18)), 4)
        
        # 绳索高光
        pygame.draw.line(screen, (200, 210, 220),
                        (int(self.x - 1), GRID_OFFSET_Y), 
                        (int(self.x - 1), int(self.y - 18)), 1)
        
        # 爪子主体 - 圆润设计
        body_width = 50
        body_height = 20
        body_x = int(self.x - body_width/2)
        body_y = int(self.y - 24)
        
        # 主体阴影
        shadow_rect = pygame.Rect(body_x + 2, body_y + 2, body_width, body_height)
        pygame.draw.rect(screen, (100, 110, 120), shadow_rect, border_radius=10)
        
        # 主体填充 - 莫兰迪紫色
        body_rect = pygame.Rect(body_x, body_y, body_width, body_height)
        pygame.draw.rect(screen, MORANDI_PURPLE, body_rect, border_radius=10)
        
        # 主体高光
        highlight_rect = pygame.Rect(body_x + 5, body_y + 3, body_width - 10, 6)
        highlight_surf = pygame.Surface((highlight_rect.width, highlight_rect.height), pygame.SRCALPHA)
        for i in range(highlight_rect.height):
            alpha = int(80 * (1 - i / highlight_rect.height))
            pygame.draw.line(highlight_surf, (255, 255, 255, alpha), (0, i), (highlight_rect.width, i))
        screen.blit(highlight_surf, highlight_rect.topleft)
        
        # 主体边框
        border_color = tuple(max(0, c - 50) for c in MORANDI_PURPLE)
        pygame.draw.rect(screen, border_color, body_rect, 2, border_radius=10)
        
        # 装饰线
        deco_y = body_y + body_height // 2
        pygame.draw.line(screen, border_color, (body_x + 10, deco_y), (body_x + body_width - 10, deco_y), 1)
        
        # 爪子臂 - 更流畅的曲线形状
        arm_base_color = MORANDI_BLUE
        arm_shadow = tuple(max(0, c - 40) for c in arm_base_color)
        
        # 左臂 - 更优雅的形状
        left_points = [
            (int(self.x - 18), int(self.y - 4)),
            (int(self.x - 32), int(self.y + 30)),
            (int(self.x - 27), int(self.y + 32)),
            (int(self.x - 15), int(self.y - 2))
        ]
        
        # 左臂阴影
        left_shadow = [(p[0] + 1, p[1] + 1) for p in left_points]
        pygame.draw.polygon(screen, arm_shadow, left_shadow)
        
        # 左臂主体
        pygame.draw.polygon(screen, arm_base_color, left_points)
        
        # 左臂高光
        left_highlight = [
            (int(self.x - 16), int(self.y - 2)),
            (int(self.x - 28), int(self.y + 28)),
            (int(self.x - 26), int(self.y + 28)),
            (int(self.x - 15), int(self.y - 1))
        ]
        pygame.draw.polygon(screen, (220, 230, 240), left_highlight)
        
        # 左臂边框
        pygame.draw.polygon(screen, arm_shadow, left_points, 2)
        
        # 右臂
        right_points = [
            (int(self.x + 18), int(self.y - 4)),
            (int(self.x + 32), int(self.y + 30)),
            (int(self.x + 27), int(self.y + 32)),
            (int(self.x + 15), int(self.y - 2))
        ]
        
        # 右臂阴影
        right_shadow = [(p[0] + 1, p[1] + 1) for p in right_points]
        pygame.draw.polygon(screen, arm_shadow, right_shadow)
        
        # 右臂主体
        pygame.draw.polygon(screen, arm_base_color, right_points)
        
        # 右臂高光
        right_highlight = [
            (int(self.x + 16), int(self.y - 2)),
            (int(self.x + 28), int(self.y + 28)),
            (int(self.x + 26), int(self.y + 28)),
            (int(self.x + 15), int(self.y - 1))
        ]
        pygame.draw.polygon(screen, (220, 230, 240), right_highlight)
        
        # 右臂边框
        pygame.draw.polygon(screen, arm_shadow, right_points, 2)
        
        # 爪子尖端 - 圆润的抓握点
        tip_color = MORANDI_PINK
        tip_shadow = tuple(max(0, c - 40) for c in tip_color)
        
        for pos in [(int(self.x - 29), int(self.y + 31)), (int(self.x + 29), int(self.y + 31))]:
            # 阴影
            pygame.draw.circle(screen, tip_shadow, (pos[0] + 1, pos[1] + 1), 6)
            # 主体
            pygame.draw.circle(screen, tip_color, pos, 6)
            # 高光
            pygame.draw.circle(screen, (240, 230, 235), (pos[0] - 1, pos[1] - 1), 3)
            # 边框
            pygame.draw.circle(screen, tip_shadow, pos, 6, 2)


class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Tetris Claw")
        self.clock = pygame.time.Clock()
        self.running = True
        self.mode = GameMode.MENU
        
        # Game state
        self.score = 0
        self.high_scores = {
            'endless': 0,
            'time_attack': 0,
            'levels': [0] * 10
        }
        self.tetrominoes: List[Tetromino] = []
        self.grid = [[None for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.claw = Claw(GRID_WIDTH * BLOCK_SIZE // 2 + GRID_OFFSET_X, 150 + GRID_OFFSET_Y)
        self.grabbed_piece: Optional[Tetromino] = None
        
        # Timing
        self.spawn_timer = 0
        self.spawn_interval = 3500  # milliseconds - 降低生成速度
        
        # Time Attack mode
        self.time_remaining = 60000  # 60 seconds in milliseconds
        
        # Levels mode
        self.current_level = 1
        self.level_goal = 5
        self.pieces_collected = 0
        
        # Mode selection
        self.selected_mode_index = 0
        self.mode_options = ['ENDLESS', 'TIME ATTACK', 'LEVELS']
        
        # EXIT box - positioned at bottom right of entire screen
        self.exit_box = pygame.Rect(EXIT_BOX_X, EXIT_BOX_Y, EXIT_BOX_WIDTH, EXIT_BOX_HEIGHT)
        
        # Particle system for effects
        self.particles: List[Particle] = []
        
        # Decorative elements for the right side gap
        self.decorative_particles = []
        self.init_decorative_elements()
        
        # Font
        self.font_large = pygame.font.Font(None, 64)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
    
    def init_decorative_elements(self):
        """初始化全屏背景漂浮粒子"""
        import random
        self.decorative_particles = []
        
        # 创建全屏背景漂浮粒子 - 增加数量，覆盖整个屏幕
        for i in range(50):
            x = random.uniform(20, SCREEN_WIDTH - 20)
            y = random.uniform(20, SCREEN_HEIGHT - 20)
            self.decorative_particles.append({
                'x': x,
                'y': y,
                'base_y': y,
                'speed': random.uniform(0.2, 0.6),
                'amplitude': random.uniform(8, 25),
                'phase': random.uniform(0, 6.28),
                'size': random.randint(2, 4),
                'color': random.choice([MORANDI_BLUE, MORANDI_PINK, MORANDI_PURPLE, MORANDI_GREEN, MORANDI_YELLOW]),
                'alpha': random.randint(30, 80)  # 更低的透明度，作为柔和背景
            })

        
    def spawn_tetromino(self):
        """Spawn a tetromino from the bottom - stacking properly"""
        shape_key = random.choice(list(SHAPES.keys()))
        shape_data = SHAPES[shape_key]
        blocks = shape_data['blocks']
        
        # Normalize blocks to start from (0, 0)
        min_x = min(b[0] for b in blocks)
        min_y = min(b[1] for b in blocks)
        normalized_blocks = [(bx - min_x, by - min_y) for bx, by in blocks]
        
        # Get shape dimensions
        max_x = max(b[0] for b in normalized_blocks)
        max_y = max(b[1] for b in normalized_blocks)
        shape_width = max_x + 1
        shape_height = max_y + 1
        
        # Random column that keeps shape fully inside grid
        if shape_width > GRID_WIDTH:
            return  # Shape too wide
        start_col = random.randint(0, GRID_WIDTH - shape_width)
        
        # Find the lowest position where this piece can rest
        # Start from the bottom and move up until we find a valid position
        spawn_row = GRID_HEIGHT - shape_height  # Start with piece at bottom
        
        # Check each block's column to find obstacles
        for bx, by in normalized_blocks:
            col = start_col + bx
            
            # Find the topmost occupied cell in this column
            for row in range(GRID_HEIGHT):
                if self.grid[row][col] is not None:
                    # Found an obstacle at 'row'
                    # This block (at offset 'by' from spawn_row) would be at spawn_row + by
                    # We need spawn_row + by < row (piece must be above obstacle)
                    # So spawn_row < row - by
                    # Therefore spawn_row = row - by - 1
                    max_spawn_row = row - by - 1
                    spawn_row = min(spawn_row, max_spawn_row)
                    break
        
        # Check if spawn position is valid
        if spawn_row < 0:
            return  # No space to spawn
        
        # Calculate screen position (center of shape)
        center_x = max_x / 2.0
        center_y = max_y / 2.0
        spawn_x = (start_col + center_x) * BLOCK_SIZE + BLOCK_SIZE / 2 + GRID_OFFSET_X
        spawn_y = (spawn_row + center_y) * BLOCK_SIZE + BLOCK_SIZE / 2 + GRID_OFFSET_Y
        
        # Create tetromino and mark grid
        grid_positions = []
        for bx, by in normalized_blocks:
            grid_x = start_col + bx
            grid_y = spawn_row + by
            
            if 0 <= grid_x < GRID_WIDTH and 0 <= grid_y < GRID_HEIGHT:
                self.grid[grid_y][grid_x] = shape_key
                grid_positions.append((grid_x, grid_y))
        
        if not grid_positions:
            return  # Failed to place
        
        tetromino = Tetromino(
            x=spawn_x,
            y=spawn_y,
            shape_key=shape_key,
            blocks=normalized_blocks,  # Use normalized blocks
            color=shape_data['color'],
            grid_positions=grid_positions
        )
        
        self.tetrominoes.append(tetromino)
    
    def grab_piece(self):
        """Try to grab a tetromino at claw position"""
        if self.grabbed_piece:
            return
        
        for tetromino in self.tetrominoes:
            # Calculate bounds
            min_x = tetromino.x + min(b[0] for b in tetromino.blocks) * BLOCK_SIZE - BLOCK_SIZE/2
            max_x = tetromino.x + max(b[0] for b in tetromino.blocks) * BLOCK_SIZE + BLOCK_SIZE/2
            min_y = tetromino.y - max(b[1] for b in tetromino.blocks) * BLOCK_SIZE - BLOCK_SIZE/2
            max_y = tetromino.y - min(b[1] for b in tetromino.blocks) * BLOCK_SIZE + BLOCK_SIZE/2
            
            # Expanded grab area
            if (min_x - 20 <= self.claw.x <= max_x + 20 and 
                min_y - 20 <= self.claw.y <= max_y + 20):
                self.grabbed_piece = tetromino
                
                # Start delivery sequence: Stage 1 - Lift vertically to top
                self.claw.state = 'lifting'
                self.claw.delivery_stage = 1
                self.claw.auto_moving = True
                self.claw.move_to(self.claw.x, GRID_OFFSET_Y + 50)  # Lift to top
                
                # Clear grid
                for gx, gy in tetromino.grid_positions:
                    if 0 <= gy < GRID_HEIGHT and 0 <= gx < GRID_WIDTH:
                        self.grid[gy][gx] = None
                
                # 应用重力，让上方的方块下落
                self.apply_gravity()
                
                break
    
    def apply_gravity(self):
        """应用重力 - 让悬空的方块下落"""
        # 对于每个方块，检查它下方是否有支撑
        # 从下往上检查，确保下层方块先下落
        changed = True
        while changed:
            changed = False
            
            for tetromino in self.tetrominoes:
                if tetromino == self.grabbed_piece:
                    continue
                
                # 检查这个方块是否可以下落
                can_fall = self.check_can_fall(tetromino)
                
                if can_fall:
                    # 清除当前位置
                    for gx, gy in tetromino.grid_positions:
                        if 0 <= gy < GRID_HEIGHT and 0 <= gx < GRID_WIDTH:
                            self.grid[gy][gx] = None
                    
                    # 下落一行
                    for i in range(len(tetromino.grid_positions)):
                        gx, gy = tetromino.grid_positions[i]
                        tetromino.grid_positions[i] = (gx, gy + 1)
                    
                    # 更新显示位置
                    tetromino.y += BLOCK_SIZE
                    
                    # 在新位置放置
                    for gx, gy in tetromino.grid_positions:
                        if 0 <= gy < GRID_HEIGHT and 0 <= gx < GRID_WIDTH:
                            self.grid[gy][gx] = tetromino.color
                    
                    changed = True
    
    def check_can_fall(self, tetromino):
        """检查方块是否可以下落"""
        # 检查每个块下方是否有障碍
        for gx, gy in tetromino.grid_positions:
            # 检查是否已经到达底部
            if gy + 1 >= GRID_HEIGHT:
                return False
            
            # 检查下方是否有其他方块（不是当前方块的一部分）
            if self.grid[gy + 1][gx] is not None:
                # 确保下方的方块不是自己的一部分
                is_self = False
                for check_gx, check_gy in tetromino.grid_positions:
                    if check_gx == gx and check_gy == gy + 1:
                        is_self = True
                        break
                
                if not is_self:
                    return False
        
        return True
    
    def deliver_piece(self):
        """Handle piece delivery and falling animation"""
        if not self.grabbed_piece:
            return
        
        # Start the falling animation
        self.grabbed_piece.falling = True
        self.grabbed_piece.fall_speed = 0
        self.grabbed_piece.target_y = self.exit_box.centery
        
        # Move to stage 4: piece is falling
        self.claw.delivery_stage = 4
    
    def update_falling_piece(self):
        """Update falling piece animation"""
        if self.grabbed_piece and hasattr(self.grabbed_piece, 'falling') and self.grabbed_piece.falling:
            # Gravity acceleration
            self.grabbed_piece.fall_speed += 0.5
            self.grabbed_piece.y += self.grabbed_piece.fall_speed
            
            # Check if reached EXIT box
            if self.grabbed_piece.y >= self.grabbed_piece.target_y:
                self.grabbed_piece.y = self.grabbed_piece.target_y
                
                # Create particle effects - 破碎 + 烟花
                self.create_shatter_effect(self.grabbed_piece.x, self.grabbed_piece.y, self.grabbed_piece.color)
                self.create_firework_effect(self.grabbed_piece.x, self.grabbed_piece.y, self.grabbed_piece.color)
                
                # Complete delivery
                self.tetrominoes.remove(self.grabbed_piece)
                self.grabbed_piece = None
                self.score += 100
                
                # Level mode piece collection
                if self.mode == GameMode.LEVELS:
                    self.pieces_collected += 1
                    if self.pieces_collected >= self.level_goal:
                        if self.current_level < 10:
                            self.mode = GameMode.LEVEL_COMPLETE
                        else:
                            self.mode = GameMode.GAME_OVER
                            if self.score > self.high_scores['levels'][self.current_level - 1]:
                                self.high_scores['levels'][self.current_level - 1] = self.score
                
                # Reset claw
                self.claw.auto_moving = False
                self.claw.state = 'idle'
                self.claw.delivery_stage = 0
                self.claw.target_x = self.claw.x
                self.claw.target_y = self.claw.y
    
    def create_shatter_effect(self, x, y, color):
        """创建破碎效果 - 方块碎片向外飞散"""
        import random
        for i in range(15):  # 15个碎片
            angle = random.uniform(0, 2 * 3.14159)
            speed = random.uniform(2, 8)
            vx = speed * math.cos(angle)
            vy = speed * math.sin(angle) - random.uniform(2, 5)  # 向上飞
            
            particle = Particle(
                x=x + random.uniform(-20, 20),
                y=y + random.uniform(-20, 20),
                vx=vx,
                vy=vy,
                color=color,
                lifetime=random.randint(30, 50),
                size=random.randint(3, 7),
                particle_type='debris'
            )
            self.particles.append(particle)
    
    def create_firework_effect(self, x, y, color):
        """创建烟花效果 - 彩色粒子向上爆发"""
        import random
        # 烟花颜色 - 莫兰迪色系
        firework_colors = [MORANDI_PINK, MORANDI_YELLOW, MORANDI_BLUE, MORANDI_PURPLE, MORANDI_GREEN]
        
        for i in range(30):  # 30个烟花粒子
            angle = random.uniform(0, 2 * 3.14159)
            speed = random.uniform(3, 10)
            vx = speed * math.cos(angle)
            vy = speed * math.sin(angle) - random.uniform(3, 8)  # 向上爆发
            
            particle = Particle(
                x=x,
                y=y,
                vx=vx,
                vy=vy,
                color=random.choice(firework_colors),
                lifetime=random.randint(40, 70),
                size=random.randint(2, 5),
                particle_type='firework'
            )
            self.particles.append(particle)
    
    def update_particles(self):
        """更新所有粒子"""
        for particle in self.particles[:]:
            # 更新位置
            particle.x += particle.vx
            particle.y += particle.vy
            
            # 重力影响
            particle.vy += 0.3  # 重力加速度
            
            # 空气阻力
            particle.vx *= 0.98
            
            # 减少生命
            particle.lifetime -= 1
            
            # 移除死亡粒子
            if particle.lifetime <= 0:
                self.particles.remove(particle)
    
    def update_decorative_particles(self):
        """更新装饰粒子 - 漂浮效果"""
        for p in self.decorative_particles:
            # 正弦波漂浮
            p['phase'] += p['speed'] * 0.05
            p['y'] = p['base_y'] + math.sin(p['phase']) * p['amplitude']
    
    def draw_particles(self):
        """绘制所有粒子"""
        for particle in self.particles:
            # 根据剩余生命计算透明度
            alpha = int(255 * (particle.lifetime / 70))
            alpha = min(255, max(0, alpha))
            
            # 绘制粒子
            if particle.particle_type == 'firework':
                # 烟花粒子 - 发光效果
                for i in range(2, 0, -1):
                    glow_alpha = int(alpha * 0.5 * (1 - i / 2))
                    pygame.draw.circle(self.screen, (*particle.color, glow_alpha), 
                                     (int(particle.x), int(particle.y)), 
                                     particle.size + i)
                pygame.draw.circle(self.screen, (*particle.color, alpha), 
                                 (int(particle.x), int(particle.y)), 
                                 particle.size)
            else:  # debris
                # 碎片 - 方块状
                rect = pygame.Rect(int(particle.x), int(particle.y), particle.size, particle.size)
                surf = pygame.Surface((particle.size, particle.size), pygame.SRCALPHA)
                surf.fill((*particle.color, alpha))
                self.screen.blit(surf, rect)
    
    def draw_decorative_elements(self):
        """绘制右侧装饰元素和操作说明"""
        # 先绘制背景漂浮粒子
        for p in self.decorative_particles:
            # 绘制半透明粒子作为背景
            surf = pygame.Surface((p['size'] * 2, p['size'] * 2), pygame.SRCALPHA)
            pygame.draw.circle(surf, (*p['color'], p['alpha']), (p['size'], p['size']), p['size'])
            self.screen.blit(surf, (int(p['x'] - p['size']), int(p['y'] - p['size'])))
        
        # 操作说明面板位置
        panel_x = GRID_OFFSET_X + GRID_WIDTH * BLOCK_SIZE + 25
        panel_width = EXIT_BOX_X - panel_x - 25
        panel_y = GRID_OFFSET_Y + 30
        
        # 标题
        title_font = pygame.font.Font(None, 28)
        title_text = title_font.render("CONTROLS", True, MORANDI_PURPLE)
        title_rect = title_text.get_rect(centerx=panel_x + panel_width // 2, y=panel_y)
        self.screen.blit(title_text, title_rect)
        
        # 分隔线
        line_y = title_rect.bottom + 10
        pygame.draw.line(self.screen, MORANDI_PURPLE,
                        (panel_x + 10, line_y),
                        (panel_x + panel_width - 10, line_y), 2)
        
        # 操作说明列表
        controls = [
            ("W", "Move Up"),
            ("S", "Move Down"),
            ("A", "Move Left"),
            ("D", "Move Right"),
            ("SPACE", "Grab/Drop"),
            ("ESC", "Menu")
        ]
        
        key_font = pygame.font.Font(None, 24)
        desc_font = pygame.font.Font(None, 20)
        
        y_offset = line_y + 20
        for key, desc in controls:
            # 按键背景框
            key_text = key_font.render(key, True, WHITE)
            key_width = max(60, key_text.get_width() + 16)
            key_rect = pygame.Rect(panel_x + 10, y_offset, key_width, 32)
            
            # 绘制按键框 - 莫兰迪风格
            pygame.draw.rect(self.screen, (45, 50, 58), key_rect, border_radius=6)
            pygame.draw.rect(self.screen, MORANDI_BLUE, key_rect, 2, border_radius=6)
            
            # 按键文字
            key_text_rect = key_text.get_rect(center=key_rect.center)
            self.screen.blit(key_text, key_text_rect)
            
            # 说明文字
            desc_text = desc_font.render(desc, True, MORANDI_GRAY)
            desc_rect = desc_text.get_rect(left=key_rect.right + 12, centery=key_rect.centery)
            self.screen.blit(desc_text, desc_rect)
            
            y_offset += 45
        
        # 底部提示 - 指向EXIT的箭头
        tip_y = y_offset + 20
        tip_font = pygame.font.Font(None, 18)
        tip_text = tip_font.render("Deliver pieces to", True, (120, 130, 145))
        tip_rect = tip_text.get_rect(centerx=panel_x + panel_width // 2, y=tip_y)
        self.screen.blit(tip_text, tip_rect)
        
        # 箭头指向EXIT
        arrow_y = tip_rect.bottom + 15
        arrow_points = [
            (panel_x + panel_width // 2, arrow_y),
            (panel_x + panel_width // 2 - 6, arrow_y + 12),
            (panel_x + panel_width // 2 + 6, arrow_y + 12)
        ]
        pygame.draw.polygon(self.screen, MORANDI_GREEN, arrow_points)
    
    def draw_tetromino(self, tetromino: Tetromino):
        """Draw a tetromino with clean, simple style"""
        for bx, by in tetromino.blocks:
            center_offset_x = sum(b[0] for b in tetromino.blocks) / len(tetromino.blocks)
            center_offset_y = sum(b[1] for b in tetromino.blocks) / len(tetromino.blocks)
            
            x = tetromino.x + (bx - center_offset_x) * BLOCK_SIZE
            y = tetromino.y - (by - center_offset_y) * BLOCK_SIZE
            
            # Block rect
            block_size = BLOCK_SIZE - 4
            rect = pygame.Rect(x - block_size/2, y - block_size/2, block_size, block_size)
            
            # Simple filled rect with subtle border
            pygame.draw.rect(self.screen, tetromino.color, rect, border_radius=6)
            
            # Subtle highlight on top
            highlight_rect = pygame.Rect(rect.x + 3, rect.y + 3, rect.width - 6, rect.height // 3)
            highlight_surf = pygame.Surface((highlight_rect.width, highlight_rect.height), pygame.SRCALPHA)
            for i in range(highlight_rect.height):
                alpha = int(60 * (1 - i / highlight_rect.height))
                pygame.draw.line(highlight_surf, (255, 255, 255, alpha), (0, i), (highlight_rect.width, i))
            self.screen.blit(highlight_surf, highlight_rect.topleft)
            
            # Border
            border_color = tuple(max(0, c - 40) for c in tetromino.color)
            pygame.draw.rect(self.screen, border_color, rect, 2, border_radius=6)
    
    def draw_menu(self):
        """Draw main menu with clean, professional design"""
        import math, time
        
        # Simple gradient background
        draw_gradient_bg(self.screen, DARKER_BG, DARK_BG)
        
        # Clean title
        current_time = time.time()
        pulse = (math.sin(current_time * 1.5) + 1) / 2
        
        # Main title - simple and clean
        title_font = pygame.font.Font(None, 72)
        title_text = "TETRIS CLAW"
        title = title_font.render(title_text, True, (220, 230, 250))
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 200))
        self.screen.blit(title, title_rect)
        
        # Subtle subtitle
        subtitle_font = pygame.font.Font(None, 24)
        subtitle = subtitle_font.render("Master the Perfect Drop", True, (140, 150, 180))
        subtitle_rect = subtitle.get_rect(center=(SCREEN_WIDTH // 2, 270))
        self.screen.blit(subtitle, subtitle_rect)
        
        # Simple button
        button_y = 400
        button_width = 320
        button_height = 55
        button_rect = pygame.Rect(SCREEN_WIDTH // 2 - button_width // 2, button_y, button_width, button_height)
        
        # Button with subtle pulse
        button_alpha = int(200 + pulse * 40)
        button_surf = pygame.Surface((button_width, button_height), pygame.SRCALPHA)
        pygame.draw.rect(button_surf, (80, 100, 140, 30), button_surf.get_rect(), border_radius=8)
        pygame.draw.rect(button_surf, (120, 160, 220, button_alpha), button_surf.get_rect(), 2, border_radius=8)
        self.screen.blit(button_surf, (button_rect.x, button_rect.y))
        
        # Button text
        button_font = pygame.font.Font(None, 32)
        play_text = button_font.render("PRESS SPACE TO START", True, (180, 200, 240))
        play_rect = play_text.get_rect(center=button_rect.center)
        self.screen.blit(play_text, play_rect)
        
        # Quit text
        quit_font = pygame.font.Font(None, 20)
        quit_text = quit_font.render("Press ESC to quit", True, (100, 110, 130))
        quit_rect = quit_text.get_rect(center=(SCREEN_WIDTH // 2, 720))
        self.screen.blit(quit_text, quit_rect)
    
    def draw_mode_select(self):
        """Draw mode selection screen with modern design"""
        # Gradient background
        draw_gradient_bg(self.screen, DARKER_BG, DARK_BG)
        
        # Title with glow
        title = self.font_large.render("SELECT MODE", True, WHITE)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 100))
        
        for offset in [(2, 2), (-2, 2), (2, -2), (-2, -2)]:
            glow = self.font_large.render("SELECT MODE", True, (*MORANDI_PURPLE, 80))
            self.screen.blit(glow, (title_rect.x + offset[0], title_rect.y + offset[1]))
        
        self.screen.blit(title, title_rect)
        
        # Mode buttons with glassmorphism
        button_y_start = 250
        button_spacing = 120
        
        for i, mode_name in enumerate(self.mode_options):
            y_pos = button_y_start + i * button_spacing
            button_rect = pygame.Rect(SCREEN_WIDTH // 2 - 150, y_pos - 35, 300, 70)
            
            if i == self.selected_mode_index:
                # Selected: glowing border
                draw_glow_rect(self.screen, MORANDI_BLUE, button_rect, glow_size=15, border_radius=15)
                text_color = WHITE
                hs_color = MORANDI_BLUE
            else:
                # Unselected: subtle
                glass_surf = pygame.Surface((300, 70), pygame.SRCALPHA)
                glass_surf.fill((*HUD_BG, 100))
                self.screen.blit(glass_surf, button_rect.topleft)
                pygame.draw.rect(self.screen, (*GRID_COLOR, 150), button_rect, 2, border_radius=15)
                text_color = (180, 180, 200)
                hs_color = (120, 120, 140)
            
            # Mode name with glow if selected
            mode_text = self.font_medium.render(mode_name, True, text_color)
            mode_rect = mode_text.get_rect(center=(SCREEN_WIDTH // 2, y_pos))
            
            if i == self.selected_mode_index:
                for offset in [(1, 1), (-1, 1), (1, -1), (-1, -1)]:
                    glow = self.font_medium.render(mode_name, True, (*MORANDI_BLUE, 100))
                    self.screen.blit(glow, (mode_rect.x + offset[0], mode_rect.y + offset[1]))
            
            self.screen.blit(mode_text, mode_rect)
            
            # High score
            if mode_name == 'ENDLESS':
                hs = self.high_scores['endless']
            elif mode_name == 'TIME ATTACK':
                hs = self.high_scores['time_attack']
            else:
                hs = max(self.high_scores['levels'])
            
            hs_text = self.font_small.render(f"Best: {hs}", True, hs_color)
            hs_rect = hs_text.get_rect(center=(SCREEN_WIDTH // 2, y_pos + 25))
            self.screen.blit(hs_text, hs_rect)
        
        # Instructions
        inst_text = self.font_small.render("W/S: Select | SPACE: Confirm | ESC: Back", True, MORANDI_GRAY)
        inst_rect = inst_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50))
        self.screen.blit(inst_text, inst_rect)
    
    def draw_game(self):
        """Draw game screen with clean design"""
        # Simple gradient background
        draw_gradient_bg(self.screen, DARKER_BG, DARK_BG)
        
        # HUD area
        hud_bg = pygame.Rect(0, 0, SCREEN_WIDTH, GRID_OFFSET_Y)
        pygame.draw.rect(self.screen, (30, 35, 42), hud_bg)
        pygame.draw.line(self.screen, MORANDI_BLUE, 
                        (0, GRID_OFFSET_Y - 2), 
                        (SCREEN_WIDTH, GRID_OFFSET_Y - 2), 3)
        
        # Grid area with border
        grid_bg = pygame.Rect(GRID_OFFSET_X, GRID_OFFSET_Y, 
                             GRID_WIDTH * BLOCK_SIZE, GRID_HEIGHT * BLOCK_SIZE)
        pygame.draw.rect(self.screen, (18, 20, 26), grid_bg)
        
        # Grid outer border - 莫兰迪色
        pygame.draw.rect(self.screen, MORANDI_PURPLE, grid_bg, 3, border_radius=2)
        
        # Subtle inner shadow
        shadow_rect = pygame.Rect(GRID_OFFSET_X + 3, GRID_OFFSET_Y + 3,
                                 GRID_WIDTH * BLOCK_SIZE - 6, GRID_HEIGHT * BLOCK_SIZE - 6)
        pygame.draw.rect(self.screen, (25, 28, 34), shadow_rect, 1)
        
        # Simple grid lines - more subtle
        for x in range(1, GRID_WIDTH):  # Skip outer edges
            line_x = x * BLOCK_SIZE + GRID_OFFSET_X
            pygame.draw.line(self.screen, (35, 40, 50), 
                           (line_x, GRID_OFFSET_Y + 3), 
                           (line_x, GRID_HEIGHT * BLOCK_SIZE + GRID_OFFSET_Y - 3))
        for y in range(1, GRID_HEIGHT):  # Skip outer edges
            line_y = y * BLOCK_SIZE + GRID_OFFSET_Y
            pygame.draw.line(self.screen, (35, 40, 50), 
                           (GRID_OFFSET_X + 3, line_y), 
                           (GRID_WIDTH * BLOCK_SIZE + GRID_OFFSET_X - 3, line_y))
        
        # Danger line with pulsing effect
        import math
        import time
        pulse = (math.sin(time.time() * 3) + 1) / 2
        danger_y = 3 * BLOCK_SIZE + GRID_OFFSET_Y
        danger_alpha = int(140 + pulse * 80)
        pygame.draw.line(self.screen, MORANDI_PINK, 
                        (GRID_OFFSET_X + 5, danger_y), 
                        (GRID_WIDTH * BLOCK_SIZE + GRID_OFFSET_X - 5, danger_y), 3)
        
        # Beautiful EXIT box - 莫兰迪风格
        # Shadow
        exit_shadow = pygame.Rect(self.exit_box.x + 3, self.exit_box.y + 3, 
                                 self.exit_box.width, self.exit_box.height)
        pygame.draw.rect(self.screen, (20, 25, 30), exit_shadow, border_radius=12)
        
        # Main box
        pygame.draw.rect(self.screen, (35, 42, 48), self.exit_box, border_radius=12)
        
        # Inner highlight
        inner_rect = pygame.Rect(self.exit_box.x + 8, self.exit_box.y + 8,
                                self.exit_box.width - 16, self.exit_box.height - 16)
        pygame.draw.rect(self.screen, (45, 52, 58), inner_rect, border_radius=8)
        
        # Border - 莫兰迪绿色
        pygame.draw.rect(self.screen, MORANDI_GREEN, self.exit_box, 4, border_radius=12)
        
        # EXIT text with shadow
        exit_font = pygame.font.Font(None, 48)
        exit_shadow_text = exit_font.render("EXIT", True, (60, 70, 75))
        exit_shadow_rect = exit_shadow_text.get_rect(center=(self.exit_box.centerx + 2, self.exit_box.centery + 2))
        self.screen.blit(exit_shadow_text, exit_shadow_rect)
        
        exit_text = exit_font.render("EXIT", True, MORANDI_GREEN)
        exit_rect = exit_text.get_rect(center=self.exit_box.center)
        self.screen.blit(exit_text, exit_rect)
        
        # Decorative corner dots
        dot_positions = [
            (self.exit_box.x + 12, self.exit_box.y + 12),
            (self.exit_box.right - 12, self.exit_box.y + 12),
            (self.exit_box.x + 12, self.exit_box.bottom - 12),
            (self.exit_box.right - 12, self.exit_box.bottom - 12)
        ]
        for pos in dot_positions:
            pygame.draw.circle(self.screen, MORANDI_GREEN, pos, 3)
        
        # Draw decorative elements in the gap
        self.draw_decorative_elements()
        
        # Draw tetrominoes
        for tetromino in self.tetrominoes:
            if tetromino != self.grabbed_piece:
                self.draw_tetromino(tetromino)
        
        # Draw grabbed piece (follows claw unless falling)
        if self.grabbed_piece:
            if hasattr(self.grabbed_piece, 'falling') and self.grabbed_piece.falling:
                # Piece is falling - don't update position, it updates itself
                pass
            else:
                # Piece follows claw
                self.grabbed_piece.x = self.claw.x
                self.grabbed_piece.y = self.claw.y + 40
            
            self.draw_tetromino(self.grabbed_piece)
        
        # Draw claw
        self.claw.draw(self.screen)
        
        # Draw particles (烟花和破碎效果)
        self.draw_particles()
        
        # HUD - Score
        score_text = self.font_medium.render(f"SCORE: {self.score}", True, (200, 210, 230))
        self.screen.blit(score_text, (20, 20))
        
        # Mode-specific UI
        if self.mode == GameMode.TIME_ATTACK:
            seconds = self.time_remaining // 1000
            if seconds > 20:
                time_color = (100, 180, 220)
            elif seconds > 10:
                time_color = (220, 200, 100)
            else:
                time_color = (220, 100, 120)
            
            time_text = self.font_medium.render(f"TIME: {seconds}s", True, time_color)
            time_rect = time_text.get_rect(right=SCREEN_WIDTH - 20, y=20)
            self.screen.blit(time_text, time_rect)
        
        elif self.mode == GameMode.LEVELS:
            level_text = self.font_medium.render(f"LEVEL {self.current_level}", True, (180, 150, 220))
            level_rect = level_text.get_rect(right=SCREEN_WIDTH - 20, y=15)
            self.screen.blit(level_text, level_rect)
            
            progress_text = self.font_small.render(f"{self.pieces_collected}/{self.level_goal}", True, (150, 150, 180))
            progress_rect = progress_text.get_rect(right=SCREEN_WIDTH - 20, y=45)
            self.screen.blit(progress_text, progress_rect)
        
        # Instructions at bottom
        inst_text = self.font_small.render("WASD: Move | SPACE: Grab | ESC: Menu", True, (120, 130, 150))
        inst_rect = inst_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 20))
        self.screen.blit(inst_text, inst_rect)
    
    def draw_game_over(self):
        """Draw game over screen"""
        self.screen.fill(BLACK)
        
        title = self.font_large.render("GAME OVER", True, MORANDI_PINK)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 200))
        self.screen.blit(title, title_rect)
        
        score_text = self.font_medium.render(f"Final Score: {self.score}", True, WHITE)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, 350))
        self.screen.blit(score_text, score_rect)
        
        # Show appropriate high score
        if self.mode == GameMode.TIME_ATTACK or self.mode == GameMode.GAME_OVER:
            mode_key = 'time_attack' if self.mode == GameMode.TIME_ATTACK else 'endless'
            hs = self.high_scores.get(mode_key, 0)
            if self.score > hs:
                hs_text = self.font_medium.render("NEW HIGH SCORE!", True, MORANDI_YELLOW)
            else:
                hs_text = self.font_medium.render(f"High Score: {hs}", True, MORANDI_GRAY)
            hs_rect = hs_text.get_rect(center=(SCREEN_WIDTH // 2, 420))
            self.screen.blit(hs_text, hs_rect)
        
        continue_text = self.font_small.render("Press SPACE to continue", True, MORANDI_BLUE)
        continue_rect = continue_text.get_rect(center=(SCREEN_WIDTH // 2, 550))
        self.screen.blit(continue_text, continue_rect)
    
    def draw_level_complete(self):
        """Draw level complete screen"""
        self.screen.fill(BLACK)
        
        title = self.font_large.render("LEVEL COMPLETE!", True, MORANDI_GREEN)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 200))
        self.screen.blit(title, title_rect)
        
        level_text = self.font_medium.render(f"Level {self.current_level} Cleared", True, WHITE)
        level_rect = level_text.get_rect(center=(SCREEN_WIDTH // 2, 350))
        self.screen.blit(level_text, level_rect)
        
        score_text = self.font_medium.render(f"Score: {self.score}", True, MORANDI_GRAY)
        score_rect = score_text.get_rect(center=(SCREEN_WIDTH // 2, 420))
        self.screen.blit(score_text, score_rect)
        
        continue_text = self.font_small.render("Press SPACE for next level", True, MORANDI_BLUE)
        continue_rect = continue_text.get_rect(center=(SCREEN_WIDTH // 2, 550))
        self.screen.blit(continue_text, continue_rect)
    
    def handle_input(self):
        """Handle keyboard input"""
        keys = pygame.key.get_pressed()
        
        if self.mode in [GameMode.ENDLESS, GameMode.TIME_ATTACK, GameMode.LEVELS]:
            if not self.claw.auto_moving and self.claw.state == 'idle':
                if keys[pygame.K_w]:
                    self.claw.target_y -= 3.75
                if keys[pygame.K_s]:
                    self.claw.target_y += 3.75
                if keys[pygame.K_a]:
                    self.claw.target_x -= 3.75
                if keys[pygame.K_d]:
                    self.claw.target_x += 3.75
                
                # Clamp to bounds (within grid area)
                self.claw.target_x = max(50 + GRID_OFFSET_X, 
                                        min(GRID_WIDTH * BLOCK_SIZE - 50 + GRID_OFFSET_X, 
                                            self.claw.target_x))
                self.claw.target_y = max(120 + GRID_OFFSET_Y, 
                                        min(GRID_HEIGHT * BLOCK_SIZE - 60 + GRID_OFFSET_Y, 
                                            self.claw.target_y))
    
    def reset_game(self, mode: GameMode):
        """Reset game state for a new game"""
        self.mode = mode
        self.score = 0
        self.tetrominoes = []
        self.grid = [[None for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.grabbed_piece = None
        self.spawn_timer = 0
        self.claw = Claw(GRID_WIDTH * BLOCK_SIZE // 2 + GRID_OFFSET_X, 150 + GRID_OFFSET_Y)
        
        if mode == GameMode.TIME_ATTACK:
            self.time_remaining = 60000  # 60 seconds
        elif mode == GameMode.LEVELS:
            self.current_level = 1
            self.level_goal = 5
            self.pieces_collected = 0
    
    def next_level(self):
        """Advance to next level"""
        self.current_level += 1
        self.pieces_collected = 0
        self.level_goal = 5 + (self.current_level - 1) * 2  # Increase difficulty
        self.tetrominoes = []
        self.grid = [[None for _ in range(GRID_WIDTH)] for _ in range(GRID_HEIGHT)]
        self.grabbed_piece = None
        self.spawn_timer = 0
        self.claw = Claw(GRID_WIDTH * BLOCK_SIZE // 2 + GRID_OFFSET_X, 150 + GRID_OFFSET_Y)
        self.mode = GameMode.LEVELS
        self.grabbed_piece = None
        self.spawn_timer = 0
        self.claw = Claw(GRID_WIDTH * BLOCK_SIZE // 2 + GRID_OFFSET_X, 150 + GRID_OFFSET_Y)
        self.mode = GameMode.LEVELS
    
    def update(self, dt: int):
        """Update game state"""
        if self.mode in [GameMode.ENDLESS, GameMode.TIME_ATTACK, GameMode.LEVELS]:
            # Spawn timer
            self.spawn_timer += dt
            if self.spawn_timer >= self.spawn_interval:
                self.spawn_tetromino()
                self.spawn_timer = 0
            
            # 检测方块是否超过红线（危险线在第3行）
            danger_line_row = 3
            for tetromino in self.tetrominoes:
                if tetromino != self.grabbed_piece:  # 不检测被抓住的方块
                    # 检查方块的最小y位置（最高点）
                    min_y_grid = min(pos[1] for pos in tetromino.grid_positions)
                    if min_y_grid < danger_line_row:
                        # 游戏失败
                        if self.mode == GameMode.ENDLESS:
                            if self.score > self.high_scores['endless']:
                                self.high_scores['endless'] = self.score
                        elif self.mode == GameMode.TIME_ATTACK:
                            if self.score > self.high_scores['time_attack']:
                                self.high_scores['time_attack'] = self.score
                        self.mode = GameMode.GAME_OVER
                        return
            
            # Update claw and handle delivery stages
            if self.claw.update():
                # Claw reached target position
                if self.claw.auto_moving:
                    if self.claw.delivery_stage == 1:
                        # Stage 1 complete: Lifted to top, now move horizontally to EXIT
                        self.claw.delivery_stage = 2
                        self.claw.state = 'moving_horizontal'
                        self.claw.move_to(self.exit_box.centerx, self.claw.y)
                    
                    elif self.claw.delivery_stage == 2:
                        # Stage 2 complete: Reached EXIT position, now release piece
                        self.claw.delivery_stage = 3
                        self.claw.state = 'releasing'
                        # Release the piece - it will start falling
                        self.deliver_piece()
            
            # Update falling piece animation
            self.update_falling_piece()
            
            # Update particles
            self.update_particles()
            
            # Update decorative particles
            self.update_decorative_particles()
            
            # Time Attack mode timer
            if self.mode == GameMode.TIME_ATTACK:
                self.time_remaining -= dt
                if self.time_remaining <= 0:
                    self.time_remaining = 0
                    # Save high score
                    if self.score > self.high_scores['time_attack']:
                        self.high_scores['time_attack'] = self.score
                    self.mode = GameMode.GAME_OVER
    
    def run(self):
        """Main game loop"""
        while self.running:
            dt = self.clock.tick(FPS)
            
            # Event handling
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        if self.mode == GameMode.MENU:
                            self.running = False
                        elif self.mode == GameMode.MODE_SELECT:
                            self.mode = GameMode.MENU
                        else:
                            self.mode = GameMode.MODE_SELECT
                    
                    elif event.key == pygame.K_SPACE:
                        if self.mode == GameMode.MENU:
                            self.mode = GameMode.MODE_SELECT
                        
                        elif self.mode == GameMode.MODE_SELECT:
                            # Start selected mode
                            selected = self.mode_options[self.selected_mode_index]
                            if selected == 'ENDLESS':
                                self.reset_game(GameMode.ENDLESS)
                            elif selected == 'TIME ATTACK':
                                self.reset_game(GameMode.TIME_ATTACK)
                            elif selected == 'LEVELS':
                                self.reset_game(GameMode.LEVELS)
                        
                        elif self.mode == GameMode.GAME_OVER:
                            self.mode = GameMode.MODE_SELECT
                        
                        elif self.mode == GameMode.LEVEL_COMPLETE:
                            self.next_level()
                        
                        elif self.mode in [GameMode.ENDLESS, GameMode.TIME_ATTACK, GameMode.LEVELS]:
                            if not self.claw.auto_moving:
                                self.grab_piece()
                    
                    elif event.key == pygame.K_w:
                        if self.mode == GameMode.MODE_SELECT:
                            self.selected_mode_index = (self.selected_mode_index - 1) % len(self.mode_options)
                    
                    elif event.key == pygame.K_s:
                        if self.mode == GameMode.MODE_SELECT:
                            self.selected_mode_index = (self.selected_mode_index + 1) % len(self.mode_options)
            
            # Input handling
            self.handle_input()
            
            # Update
            self.update(dt)
            
            # Draw
            if self.mode == GameMode.MENU:
                self.draw_menu()
            elif self.mode == GameMode.MODE_SELECT:
                self.draw_mode_select()
            elif self.mode in [GameMode.ENDLESS, GameMode.TIME_ATTACK, GameMode.LEVELS]:
                self.draw_game()
            elif self.mode == GameMode.GAME_OVER:
                self.draw_game_over()
            elif self.mode == GameMode.LEVEL_COMPLETE:
                self.draw_level_complete()
            
            pygame.display.flip()
        
        pygame.quit()
        sys.exit()


if __name__ == "__main__":
    game = Game()
    game.run()
