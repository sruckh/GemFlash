#!/usr/bin/env python3
"""
Claude Configuration Validation Script
Validates YAML, JSON, and Markdown syntax in Claude configuration files
"""

import os
import re
import yaml
import json
import sys
from pathlib import Path

def validate_yaml_blocks(content, filename):
    """Extract and validate YAML blocks from markdown content"""
    errors = []
    yaml_pattern = r'```yaml\n(.*?)\n```'
    yaml_blocks = re.findall(yaml_pattern, content, re.DOTALL)

    for i, yaml_block in enumerate(yaml_blocks):
        try:
            yaml.safe_load(yaml_block)
        except yaml.YAMLError as e:
            errors.append(f"{filename} - YAML block {i+1}: {str(e)}")

    return errors

def validate_json_blocks(content, filename):
    """Extract and validate JSON blocks from markdown content"""
    errors = []
    json_pattern = r'```json\n(.*?)\n```'
    json_blocks = re.findall(json_pattern, content, re.DOTALL)

    for i, json_block in enumerate(json_blocks):
        try:
            json.loads(json_block)
        except json.JSONDecodeError as e:
            errors.append(f"{filename} - JSON block {i+1}: {str(e)}")

    return errors

def validate_markdown_syntax(content, filename):
    """Basic markdown syntax validation"""
    errors = []
    lines = content.split('\n')

    # Check for common markdown issues
    for i, line in enumerate(lines, 1):
        # Check for unmatched backticks
        if line.count('`') % 2 != 0 and not line.strip().startswith('```'):
            if '`' in line and not re.match(r'^.*```.*$', line):
                errors.append(f"{filename}:{i} - Unmatched backticks: {line.strip()}")

        # Check for malformed headers
        if line.startswith('#') and not re.match(r'^#+\s+', line):
            errors.append(f"{filename}:{i} - Malformed header (missing space): {line.strip()}")

    return errors

def validate_file_references(content, filename):
    """Validate @file references in configuration files"""
    errors = []
    ref_pattern = r'@([A-Z_]+\.md)'
    references = re.findall(ref_pattern, content)

    config_dir = Path('/root/.claude')

    for ref in references:
        ref_path = config_dir / ref
        if not ref_path.exists():
            errors.append(f"{filename} - Missing referenced file: {ref}")

    return errors

def main():
    config_dir = Path('/root/.claude')
    all_errors = []

    print("🔍 Validating Claude Configuration Files...")
    print("=" * 50)

    # Find all markdown files
    md_files = list(config_dir.glob('*.md'))

    for md_file in md_files:
        print(f"📄 Checking {md_file.name}...")

        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            all_errors.append(f"Error reading {md_file}: {str(e)}")
            continue

        # Validate YAML blocks
        yaml_errors = validate_yaml_blocks(content, md_file.name)
        all_errors.extend(yaml_errors)

        # Validate JSON blocks
        json_errors = validate_json_blocks(content, md_file.name)
        all_errors.extend(json_errors)

        # Validate markdown syntax
        md_errors = validate_markdown_syntax(content, md_file.name)
        all_errors.extend(md_errors)

        # Validate file references
        ref_errors = validate_file_references(content, md_file.name)
        all_errors.extend(ref_errors)

    print("\n📊 Validation Results:")
    print("=" * 50)

    if not all_errors:
        print("✅ All configuration files are valid!")
        return 0
    else:
        print(f"❌ Found {len(all_errors)} issues:")
        for error in all_errors:
            print(f"  • {error}")
        return 1

if __name__ == "__main__":
    sys.exit(main())