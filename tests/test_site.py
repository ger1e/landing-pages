from pathlib import Path
import re
import unittest

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'index.html').read_text(encoding='utf-8')
CSS=(ROOT/'assets'/'site.css').read_text(encoding='utf-8')
JS=(ROOT/'assets'/'site.js').read_text(encoding='utf-8')

class ResetSiteTests(unittest.TestCase):
    def test_personal_site_identity_is_scrubbed(self):
        self.assertNotIn('ム乇 尺 1 乇',HTML);self.assertNotIn('GER1E // ONLINE',HTML);self.assertIn('data-cyber-reset="1"',HTML)
    def test_single_surface_contract(self):
        self.assertIn('assets/site.css',HTML);self.assertIn('assets/site.js',HTML);self.assertNotIn('assets/core.css',HTML);self.assertNotIn('assets/fx.css',HTML)
    def test_4k_operator_contract(self):
        self.assertIn('id="operatorImage"',HTML);self.assertIn('width="3072"',HTML);self.assertIn('height="4096"',HTML);self.assertIn('fetchpriority="high"',HTML)
        self.assertIn("const HERO_SIZE=112347;",JS);self.assertIn("bf857c01b3083c8d27be9218c4a1437cb51af9b64b1ecbb8b309ba9135f47558",JS);self.assertEqual(JS.count("'8e287ce159702931c9a0a75cff970761b7ddf9b2'"),1)
    def test_cyber_fx_contract(self):
        self.assertIn('const MATRIX_SPEED=3;',JS);self.assertIn('glitchFrame',JS);self.assertIn('AudioContext',JS);self.assertIn('prefers-reduced-motion',CSS);self.assertIn('%2357e5ff',CSS)
    def test_csp_and_favicon(self):
        self.assertIn('href="assets/radar.svg"',HTML);self.assertIn("default-src 'none'",HTML);self.assertIn('connect-src https://api.github.com',HTML);self.assertIn("img-src 'self' data: blob:",HTML);self.assertNotIn('<iframe',HTML.lower())
    def test_local_static_refs_exist(self):
        refs=re.findall(r'(?:src|href)="(assets/[^"?#]+)',HTML);self.assertEqual(set(refs),{'assets/site.css','assets/loader.css','assets/site.js','assets/radar.svg'})

if __name__=='__main__':unittest.main()
