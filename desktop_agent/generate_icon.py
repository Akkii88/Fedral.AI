
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

def create_icon():
    # Create a directory for iconset
    iconset_dir = "app_icon.iconset"
    if not os.path.exists(iconset_dir):
        os.makedirs(iconset_dir)
    
    # Define sizes
    sizes = [16, 32, 64, 128, 256, 512, 1024]
    
    for size in sizes:
        # Create image with blue background
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0)) # Transparent
        draw = ImageDraw.Draw(img)
        
        # Draw Blue Circle
        margin = int(size * 0.05)
        draw.ellipse([margin, margin, size-margin, size-margin], fill="#0f172a")
        
        # Draw "F" text (Fedral)
        # Since we might not have a specific font, we'll draw simple geometry or try default
        # Let's draw a simple white cross/plus for "Health/Hospital" but stylized?
        # User wants "Fedral", let's do a stylized "F" or just "F"
        
        # Let's simple draw a white 'F' using rectangles to be font-independent
        # F vertical
        bar_w = int(size * 0.15)
        bar_h = int(size * 0.6)
        x = int(size * 0.35)
        y = int(size * 0.2)
        draw.rectangle([x, y, x+bar_w, y+bar_h], fill="white")
        
        # F top bar
        draw.rectangle([x, y, x+int(size*0.4), y+bar_w], fill="white")
        
        # F middle bar
        draw.rectangle([x, y+int(size*0.25), x+int(size*0.3), y+int(size*0.25)+bar_w], fill="white")
        
        # Save standard and @2x
        img.save(f"{iconset_dir}/icon_{size}x{size}.png")
        if size < 512: # 1024 is max
             img.save(f"{iconset_dir}/icon_{size}x{size}@2x.png")

    # Use iconutil to convert to icns
    subprocess.run(["iconutil", "-c", "icns", iconset_dir])
    print(f"Created app_icon.icns")

if __name__ == "__main__":
    create_icon()
