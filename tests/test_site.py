from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
CSS = ROOT / 'assets' / 'site.css'
JS = ROOT / 'assets' / 'site.js'

class ResetSiteTests(unittest.TestCase):
    def test_personal_site_identity_is_scrubbed(self):
        self.assertNotIn('ム乇 尺 1 乇', HTML)
        self.assertNotIn('GER1E // ONLINE', HTML)
        self.assertNotIn('<title>ム乇 尺 1 乇', HTML)
        self.assertIn('data-cyber-reset="1"', HTML)

    def test_new_single_surface_asset_contract(self):
        self.assertIn('assets/site.css', HTML)
        self.assertIn('assets/site.js', HTML)
        self.assertNotIn('assets/core.css', HTML)
        self.assertNotIn('assets/fx.css', HTML)
        self.assertTrue(CSS.exists())
        self.assertTrue(JS.exists())

    def test_high_resolution_rotund_operator(self):
        self.assertIn('assets/rotund-operator-4k.avif', HTML)
        self.assertIn('width="3072"', HTML)
        self.assertIn('height="4096"', HTML)
        self.assertIn('fetchpriority="high"', HTML)

    def test_cyber_fx_contract(self):
        js = JS.read_text(encoding='utf-8')
        css = CSS.read_text(encoding='utf-8')
        self.assertIn('const MATRIX_SPEED=3;', js)
        self.assertIn('glitchFrame', js)
        self.assertIn('AudioContext', js)
        self.assertIn('prefers-reduced-motion', css)
        self.assertIn('%2357e5ff', css)

    def test_radar_favicon_and_strict_csp(self):
        self.assertIn('href="assets/radar.svg"', HTML)
        self.assertIn("default-src 'none'", HTML)
        self.assertNotIn('<iframe', HTML.lower())

    def test_local_references_exist(self):
        refs = re.findall(r'(?:src|href)="(assets/[^"?#]+)', HTML)
        existing = {'assets/site.css','assets/site.js','assets/radar.svg','assets/rotund-operator-4k.avif'}
        self.assertEqual(set(refs), existing)

if __name__ == '__main__':
    unittest.main()
