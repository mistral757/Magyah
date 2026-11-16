"""🎨 Magyah — játékosfigura sprite-sheet a Blenderből (ablak nélkül, Cycles CPU).

Futtatás:
  blender -b -P tools/blender/jatekos-sprite.py -- --ki KIMENET_MAPPA \
      [--mez "#c8102e"] [--mez2 "#ffffff"] [--nadrag "#1d1d1b"] [--sportszar "#c8102e"] \
      [--bor "#e0ac8a"] [--haj "#3b2a1e"] [--kockak 8] [--meret 128]

Kimenet: KIMENET_MAPPA/futas_00.png … futas_07.png (átlátszó háttér).

--mod retegek (a játékba szánt, futás közben színezhető változat):
  KIMENET_MAPPA/arny_NN.png — minden testrész FEHÉR, csak a fény formálja;
  KIMENET_MAPPA/id_NN.png   — minden testrész egy egyszínű KÓD (nincs élsimítás):
      mez = piros · csík = zöld · nadrág = kék · sportszár = sárga ·
      bőr = bíbor · haj = cián · szem és cipő = fehér.
  Az atlaszt a tools/blender/sprite-atlasz.py fűzi össze, a játék (sprFut*)
  a böngészőben színezi ki a gólszerző mezére.
Az összefűzést (sprite-sheet, pixelesítés) a tools/blender/sprite-sheet.py végzi.
A figura alapformákból áll (nincs külső modell, nincs licenckérdés): stilizált,
nagy fejű „chibi" arányok, hogy kis méretben is olvasható maradjon.
"""
import bpy, math, sys, argparse, os

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--ki", required=True)
ap.add_argument("--mez", default="#c8102e"); ap.add_argument("--mez2", default="#ffffff")
ap.add_argument("--nadrag", default="#1d1d1b"); ap.add_argument("--sportszar", default="#c8102e")
ap.add_argument("--bor", default="#e0ac8a"); ap.add_argument("--haj", default="#3b2a1e")
ap.add_argument("--cipo", default="#111111")
ap.add_argument("--kockak", type=int, default=8); ap.add_argument("--meret", type=int, default=128)
ap.add_argument("--mintak", type=int, default=24)
ap.add_argument("--mod", default="alap", choices=["alap", "retegek"])
A = ap.parse_args(argv)
os.makedirs(A.ki, exist_ok=True)

def hexrgb(h):
    h = h.lstrip("#"); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    # sRGB → lineáris (a Blender lineárisan számol)
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1,)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def anyag(nev, szin, rough=0.6):
    m = bpy.data.materials.new(nev); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexrgb(szin)
    b.inputs["Roughness"].default_value = rough
    return m

M = {k: anyag(k, v) for k, v in dict(mez=A.mez, mez2=A.mez2, nadrag=A.nadrag, szar=A.sportszar,
                                       bor=A.bor, haj=A.haj, cipo=A.cipo).items()}

def ures(nev, loc, szulo=None):
    o = bpy.data.objects.new(nev, None); sc.collection.objects.link(o)
    o.location = loc
    if szulo: o.parent = szulo
    return o

def test(fajta, nev, loc, meret, anyagn, szulo=None, forg=(0, 0, 0)):
    if fajta == "gomb":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=1)
    elif fajta == "henger":
        bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=1, depth=2)
    else:
        bpy.ops.mesh.primitive_cube_add(size=2)
    o = bpy.context.object; o.name = nev
    o.scale = meret; o.location = loc; o.rotation_euler = forg
    o.data.materials.append(M[anyagn])
    bpy.ops.object.shade_smooth()
    if fajta == "kocka":
        mod = o.modifiers.new("lekerekit", "BEVEL"); mod.width = 0.35; mod.segments = 4
    if szulo:
        o.parent = szulo
        o.matrix_parent_inverse = szulo.matrix_world.inverted()
    return o

# ---- a figura (méretek: a teljes magasság ≈ 2,2) ----
gyoker = ures("gyoker", (0, 0, 0))
# A FIGURA A +X IRÁNYBA NÉZ (jobbra fut): a vállak az Y tengelyen, az arc és a
# mellcsík a +X oldalon; a kamera a −Y oldalról, oldalnézetből látja.
torzs = test("kocka", "torzs", (0, 0, 1.05), (0.20, 0.30, 0.32), "mez", gyoker)
test("kocka", "csik", (0.205, 0, 1.05), (0.01, 0.08, 0.30), "mez2", gyoker)   # mellcsík
test("kocka", "nadrag", (0, 0, 0.70), (0.21, 0.31, 0.12), "nadrag", gyoker)
fej = test("gomb", "fej", (0, 0, 1.68), (0.28, 0.30, 0.32), "bor", gyoker)
test("gomb", "haj", (-0.03, 0.0, 1.80), (0.29, 0.31, 0.22), "haj", gyoker)
M["szem"] = anyag("szem", "#1a1a1a", 0.3)
for sy in (-0.11, 0.11):   # a két szem az arc (+X) felén
    test("gomb", "szem", (0.265, sy, 1.70), (0.02, 0.035, 0.045), "szem", gyoker)

def vegtag(nev, csuklo_loc, hossz, vastag, felso_anyag, also_anyag, veg_anyag=None, vegmeret=None):
    piv = ures(nev + "_piv", csuklo_loc, gyoker)
    bpy.context.view_layer.update()
    test("henger", nev + "_f", (csuklo_loc[0], csuklo_loc[1], csuklo_loc[2] - hossz * 0.5),
         (vastag, vastag, hossz * 0.5), felso_anyag, piv)
    if also_anyag:
        test("henger", nev + "_a", (csuklo_loc[0], csuklo_loc[1], csuklo_loc[2] - hossz * 0.85),
             (vastag * 1.05, vastag * 1.05, hossz * 0.17), also_anyag, piv)
    if veg_anyag:
        test("kocka", nev + "_v", (csuklo_loc[0] + vegmeret[0] * 0.5, csuklo_loc[1], csuklo_loc[2] - hossz - vegmeret[2] * 0.5),
             vegmeret, veg_anyag, piv)
    return piv

lab_b = vegtag("lab_b", (0, 0.11, 0.66), 0.56, 0.085, "bor", "szar", "cipo", (0.13, 0.08, 0.05))
lab_j = vegtag("lab_j", (0, -0.11, 0.66), 0.56, 0.085, "bor", "szar", "cipo", (0.13, 0.08, 0.05))
kar_b = vegtag("kar_b", (0, 0.36, 1.30), 0.50, 0.07, "mez", "bor")
kar_j = vegtag("kar_j", (0, -0.36, 1.30), 0.50, 0.07, "mez", "bor")

# ---- a futóciklus: a lábak és a karok ellentétesen lengenek, a test billeg ----
N = A.kockak
sc.frame_start = 0; sc.frame_end = N - 1
for f in range(N):
    t = 2 * math.pi * f / N
    s = math.sin(t)
    # a végtagok az Y tengely körül lengenek: a mozgás az X–Z síkban, oldalról látszik
    for o, a in ((lab_b, 0.75 * s), (lab_j, -0.75 * s), (kar_b, -0.85 * s), (kar_j, 0.85 * s)):
        o.rotation_euler = (0, a, 0); o.keyframe_insert("rotation_euler", frame=f)
    gyoker.location = (0, 0, 0.06 * abs(math.cos(t)))
    gyoker.rotation_euler = (0, 0.12, 0)      # előredőlés a futás irányába
    gyoker.keyframe_insert("location", frame=f); gyoker.keyframe_insert("rotation_euler", frame=f)

# ---- fény, kamera ----
vilag = bpy.data.worlds.new("vilag"); sc.world = vilag; vilag.use_nodes = True
vilag.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.58, 0.62, 1)
vilag.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.9
bpy.ops.object.light_add(type="SUN", location=(2, -4, 6)); nap = bpy.context.object
nap.data.energy = 3.5; nap.rotation_euler = (math.radians(40), 0, math.radians(30))
bpy.ops.object.camera_add(location=(0, -8, 1.1), rotation=(math.radians(90), 0, 0))
kam = bpy.context.object; sc.camera = kam
kam.data.type = "ORTHO"; kam.data.ortho_scale = 2.6

r = sc.render
r.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = A.mintak
sc.cycles.use_denoising = False            # a csomagolt Blender OIDN nélkül épült
r.resolution_x = r.resolution_y = A.meret; r.film_transparent = True
r.image_settings.file_format = "PNG"; r.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "Standard"

def renderel(elotag):
    for f in range(N):
        sc.frame_set(f)
        r.filepath = os.path.join(A.ki, "%s_%02d.png" % (elotag, f))
        bpy.ops.render.render(write_still=True)

if A.mod == "alap":
    renderel("futas")
else:
    # 1) ÁRNYALÁS: minden anyag fehér (az érdesség marad)
    for m in M.values():
        m.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.8, 0.8, 0.8, 1)
    renderel("arny")
    # 2) AZONOSÍTÓ: egyszínű emisszió, élsimítás nélkül (a kód nem keveredhet)
    KOD = dict(mez=(1, 0, 0), mez2=(0, 1, 0), nadrag=(0, 0, 1), szar=(1, 1, 0),
               bor=(1, 0, 1), haj=(0, 1, 1), szem=(1, 1, 1), cipo=(1, 1, 1))
    for nev, m in M.items():
        nt = m.node_tree; nt.nodes.clear()
        em = nt.nodes.new("ShaderNodeEmission"); ki = nt.nodes.new("ShaderNodeOutputMaterial")
        em.inputs["Color"].default_value = KOD[nev] + (1,); em.inputs["Strength"].default_value = 1
        nt.links.new(em.outputs["Emission"], ki.inputs["Surface"])
    vilag.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
    sc.cycles.samples = 1; r.filter_size = 0.01
    renderel("id")
print("KESZ", N, "kocka ->", A.ki, A.mod)
