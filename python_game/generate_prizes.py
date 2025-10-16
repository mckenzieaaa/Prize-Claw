import os
import pygame
from prize_templates import draw_bunny, draw_teddy, draw_striped_doll, draw_cat

OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'generated')
os.makedirs(OUT_DIR, exist_ok=True)

def make_image(draw_fn, filename, size=96):
    pygame.init()
    surf = pygame.Surface((size, size), pygame.SRCALPHA)
    surf.fill((0,0,0,0))
    draw_fn(surf, (size//2, size//2), size)
    path = os.path.join(OUT_DIR, filename)
    pygame.image.save(surf, path)
    print('Saved', path)

def main():
    make_image(draw_bunny, 'prize_bunny.png', 96)
    make_image(draw_teddy, 'prize_teddy.png', 96)
    make_image(draw_striped_doll, 'prize_striped.png', 96)
    make_image(draw_cat, 'prize_cat.png', 96)

if __name__ == '__main__':
    main()
