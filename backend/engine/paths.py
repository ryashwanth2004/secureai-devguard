import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
IS_VERCEL = os.getenv("VERCEL") == "1" or "VERCEL" in os.environ

def get_studenthub_src_dir() -> Path:
    """Returns the writable studenthub_src directory.
    On Vercel Serverless, copies baseline files to /tmp for write access.
    """
    if IS_VERCEL:
        tmp_src = Path("/tmp/studenthub_src")
        if not tmp_src.exists():
            orig_src = BASE_DIR / "studenthub_src"
            if orig_src.exists():
                shutil.copytree(str(orig_src), str(tmp_src), dirs_exist_ok=True)
        return tmp_src
    return BASE_DIR / "studenthub_src"
