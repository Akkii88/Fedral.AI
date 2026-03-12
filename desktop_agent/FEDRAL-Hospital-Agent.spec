# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['hospital_agent_enhanced.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['torch', 'tensorflow', 'tensorboard', 'cv2', 'matplotlib', 'PIL', 'notebook', 'IPython', 'jedi'],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='FEDRAL-Hospital-Agent',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['app_icon.icns'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='FEDRAL-Hospital-Agent',
)
app = BUNDLE(
    coll,
    name='FEDRAL-Hospital-Agent.app',
    icon='app_icon.icns',
    bundle_identifier=None,
)
