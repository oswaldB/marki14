#!/usr/bin/env python3

import json
import os
import re
import sys
from pathlib import Path

def load_mapping():
    """Load the Font Awesome to Lucide mapping from JSON file"""
    with open('fontawesome_to_lucide_mapping.json', 'r') as f:
        return json.load(f)

def find_files_with_fontawesome(root_dir):
    """Find all files containing Font Awesome icons"""
    fontawesome_files = []
    
    # Patterns to search for
    patterns = [r'fas fa-', r'far fa-', r'fa fa-']
    
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules and other common directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.astro', 'dist']]
        
        for file in files:
            file_path = os.path.join(root, file)
            
            # Only process .astro and .js files
            if not (file.endswith('.astro') or file.endswith('.js')):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                # Check if file contains any Font Awesome patterns
                for pattern in patterns:
                    if re.search(pattern, content):
                        fontawesome_files.append(file_path)
                        break
            except (UnicodeDecodeError, PermissionError):
                continue
    
    return fontawesome_files

def replace_fontawesome_with_lucide(file_path, mapping):
    """Replace Font Awesome icons with Lucide icons in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # Pattern to match Font Awesome icons: <i class="fas fa-icon-name w-h"></i>
        # This regex captures the icon name and any size classes
        pattern = r'<i\s+class="(fas|far|fa)\s+fa-([a-z0-9-]+)(?:\s+([^"]+))?".*?</i>'
        
        def replace_match(match):
            nonlocal modified
            prefix = match.group(1)  # fas, far, or fa
            icon_name = match.group(2)  # icon name
            extra_classes = match.group(3) or ''  # extra classes like w-4 h-4
            
            # Get Lucide equivalent
            lucide_icon = mapping.get(f'fa-{icon_name}')
            
            if lucide_icon:
                modified = True
                # Return Lucide component syntax
                return f'<{lucide_icon} class="{extra_classes.strip()}" />'
            else:
                print(f"No mapping found for fa-{icon_name} in {file_path}")
                return match.group(0)  # Return original if no mapping
        
        # Replace all Font Awesome icons
        new_content = re.sub(pattern, replace_match, content)
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {file_path}")
            return True
        else:
            return False
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def update_statscard_component(file_path):
    """Update StatsCard.astro to use Lucide icons instead of Font Awesome mapping"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find the icon mapping section
        mapping_start = content.find('const iconMap = {')
        if mapping_start == -1:
            print(f"No icon mapping found in {file_path}")
            return False
        
        mapping_end = content.find('};', mapping_start) + 2
        icon_mapping = content[mapping_start:mapping_end]
        
        # Replace the entire mapping with Lucide imports and direct component usage
        mapping = load_mapping()
        
        # Generate Lucide imports
        lucide_imports = "import {\n  "
        
        # Get all unique Lucide icons used in the mapping
        lucide_icons = set()
        for fa_icon, lucide_icon in mapping.items():
            lucide_icons.add(lucide_icon)
        
        lucide_imports += ",\n  ".join(sorted(lucide_icons))
        lucide_imports += "\n} from '@lucide/astro';"
        
        # Replace the icon mapping with a function that returns Lucide components
        new_mapping = f"""
// Import Lucide icons directly
{lucide_imports}

// Function to get Lucide icon component by name
function getIconComponent(iconName) {{
  const components = {{
    {', '.join([f'"{fa_icon}": {lucide_icon}' for fa_icon, lucide_icon in mapping.items()])}
  }};
  
  return components[iconName] || null;
}}
"""
        
        new_content = content[:mapping_start] + new_mapping + content[mapping_end:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Updated StatsCard component in {file_path}")
        return True
        
    except Exception as e:
        print(f"Error updating StatsCard in {file_path}: {e}")
        return False

def main():
    if len(sys.argv) != 2:
        print("Usage: python replace_fontawesome_with_lucide.py <root_directory>")
        sys.exit(1)
    
    root_dir = sys.argv[1]
    mapping = load_mapping()
    
    print("Finding files with Font Awesome icons...")
    fontawesome_files = find_files_with_fontawesome(root_dir)
    
    if not fontawesome_files:
        print("No files with Font Awesome icons found.")
        return
    
    print(f"Found {len(fontawesome_files)} files with Font Awesome icons:")
    for file in fontawesome_files:
        print(f"  - {file}")
    
    print("\nReplacing Font Awesome icons with Lucide icons...")
    
    # First, handle StatsCard.astro specially
    statscard_path = os.path.join(root_dir, 'src', 'components', 'StatsCard.astro')
    if os.path.exists(statscard_path):
        print("Updating StatsCard component...")
        update_statscard_component(statscard_path)
    
    # Then replace icons in all other files
    for file_path in fontawesome_files:
        # Skip StatsCard.astro as we handle it separately
        if file_path.endswith('StatsCard.astro'):
            continue
            
        replace_fontawesome_with_lucide(file_path, mapping)
    
    print("\nFont Awesome to Lucide conversion complete!")

if __name__ == "__main__":
    main()