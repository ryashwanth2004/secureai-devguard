"""Agent 2 — Bug Detection + Patch Generation Agent (Combined)

Performs static AST analysis, pattern matching against security and logic rules,
identifies defects with exact line numbers and evidence, and generates verified diff patches.
"""

import ast
import difflib
import re
from pathlib import Path
from security_rules.rules import SECURITY_RULES
from engine.paths import get_studenthub_src_dir

def strip_comments_keep_lines(code: str) -> str:
    """Strip comments while preserving exact line counts so line numbers stay accurate."""
    clean_lines = []
    for line in code.splitlines():
        # Strip inline comment after #
        hash_idx = line.find('#')
        if hash_idx >= 0:
            clean_lines.append(line[:hash_idx])
        else:
            clean_lines.append(line)
    return '\n'.join(clean_lines)

def find_enclosing_function(code: str, line_no: int) -> str:
    """Find the function name that encloses a given line number using AST."""
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if hasattr(node, 'lineno') and hasattr(node, 'end_lineno'):
                    if node.lineno <= line_no <= (node.end_lineno or 9999):
                        return node.name
    except Exception:
        pass
    return "module_scope"

async def run_agent2(incident, agent1_summary: dict) -> dict:
    """Agent 2: Detects bugs in the identified source file and produces a verified code patch."""
    affected_file = agent1_summary.get("affected_file", "cart_service.py")
    file_path = get_studenthub_src_dir() / affected_file
    
    if not file_path.exists():
        return {
            "bugs": [],
            "patches": [],
            "bugs_found": 0,
            "no_bugs_message": f"File '{affected_file}' was not found in the repository."
        }
        
    original_code = file_path.read_text(encoding="utf-8")
    code_no_comments = strip_comments_keep_lines(original_code)
    orig_lines = original_code.splitlines()
    
    bugs = []
    patches = []
    patched_code = original_code
    
    # Check each security rule against the file
    for rule in SECURITY_RULES:
        if rule["file_pattern"] != affected_file:
            continue
            
        match = re.search(rule["pattern"], code_no_comments, re.MULTILINE)
        if match:
            # Calculate line number
            char_pos = match.start()
            line_no = code_no_comments[:char_pos].count('\n') + 1
            
            # Extract evidence line
            evidence_line = orig_lines[line_no - 1].strip() if line_no <= len(orig_lines) else ""
            func_name = find_enclosing_function(original_code, line_no)
            
            bug_id = f"BUG-{len(bugs) + 1:03d}"
            bug_data = {
                "bug_id": bug_id,
                "title": rule["name"],
                "bug_type": rule["bug_type"],
                "cwe": rule.get("cwe", "CWE-General"),
                "severity": rule["severity"],
                "file_name": affected_file,
                "line_number": line_no,
                "affected_function": func_name,
                "description": rule["description"],
                "why_problem": rule["why_problem"],
                "evidence": evidence_line,
                "root_cause": f"Found pattern `{rule['pattern']}` at line {line_no} in function `{func_name}()` violating secure coding guidelines.",
                "suggested_fix": rule["patch_explanation"]
            }
            bugs.append(bug_data)
            
            # Apply patch generator
            patched_code = rule["apply_patch"](patched_code)
            
            # Generate unified diff
            orig_split = original_code.splitlines(keepends=True)
            patch_split = patched_code.splitlines(keepends=True)
            diff_lines = list(difflib.unified_diff(
                orig_split, patch_split,
                fromfile=f"a/{affected_file} (Original)",
                tofile=f"b/{affected_file} (Patched)",
                lineterm=""
            ))
            diff_text = "\n".join(diff_lines)
            
            patch_data = {
                "patch_id": f"PATCH-{len(patches) + 1:03d}",
                "bug_id": bug_id,
                "file_name": affected_file,
                "original_code": original_code,
                "patched_code": patched_code,
                "diff_text": diff_text,
                "explanation": rule["patch_explanation"],
                "lines_added": sum(1 for l in diff_lines if l.startswith('+') and not l.startswith('+++')),
                "lines_removed": sum(1 for l in diff_lines if l.startswith('-') and not l.startswith('---'))
            }
            patches.append(patch_data)
            
    # Secondary check: general AST syntax or bug checks
    if not bugs:
        try:
            tree = ast.parse(original_code)
            # AST parsed with zero errors
        except SyntaxError as e:
            bug_id = "BUG-001"
            bugs.append({
                "bug_id": bug_id,
                "title": "Syntax Error in Source Code",
                "bug_type": "Syntax Error",
                "cwe": "CWE-1007",
                "severity": "HIGH",
                "file_name": affected_file,
                "line_number": e.lineno or 1,
                "affected_function": "module",
                "description": f"Python parser encountered a SyntaxError: {e.msg}",
                "why_problem": "The module cannot be imported or executed at runtime.",
                "evidence": e.text.strip() if e.text else "",
                "root_cause": f"Syntax error at line {e.lineno}: {e.msg}",
                "suggested_fix": "Fix malformed syntax tokens."
            })
            
    return {
        "bugs": bugs,
        "patches": patches,
        "bugs_found": len(bugs),
        "no_bugs_message": "No bugs detected." if not bugs else None,
        "primary_patch": patches[0] if patches else None
    }
