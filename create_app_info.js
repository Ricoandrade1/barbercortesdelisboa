const fs = require('fs');
const path = require('path');

const fileList = [
  '_redirects',
  '.gitignore',
  'components.json',
  'create-zip.js',
  'eslint.config.js',
  'index.html',
  'package-lock.json',
  'package.json',
  'postcss.config.js',
  'README.md',
  'tailwind.config.ts',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'public/',
  'public/_redirects',
  'public/favicon.ico',
  'public/icon-192x192.png',
  'public/icon-512x512.png',
  'public/manifest.json',
  'public/og-image.png',
  'public/placeholder.png',
  'public/placeholder.svg',
  'src/',
  'src/App.css',
  'src/App.tsx',
  'src/index.css',
  'src/main.tsx',
  'src/vite-env.d.ts',
  'src/components/',
  'src/components/AddBarberModal.tsx',
  'src/components/AddProductModal.tsx',
  'src/components/AddServiceModal.tsx',
  'src/components/EditProductModal.tsx',
  'src/components/ReportPDF.tsx',
  'src/components/ServiceEntry.tsx',
  'src/components/ShareButton.tsx',
  'src/components/ui/',
  'src/components/ui/accordion.tsx',
  'src/components/ui/alert-dialog.tsx',
  'src/components/ui/alert.tsx',
  'src/components/ui/aspect-ratio.tsx',
  'src/components/ui/avatar.tsx',
  'src/components/ui/badge.tsx',
  'src/components/ui/breadcrumb.tsx',
  'src/components/ui/button.tsx',
  'src/components/ui/calendar.tsx',
  'src/components/ui/card.tsx',
  'src/components/ui/carousel.tsx',
  'src/components/ui/chart.tsx',
  'src/components/ui/checkbox.tsx',
  'src/components/ui/collapsible.tsx',
  'src/components/ui/command.tsx',
  'src/components/ui/context-menu.tsx',
  'src/components/ui/dialog.tsx',
  'src/components/ui/drawer.tsx',
  'src/components/ui/dropdown-menu.tsx',
  'src/components/ui/form.tsx',
  'src/components/ui/hover-card.tsx',
  'src/components/ui/input-otp.tsx',
  'src/components/ui/input.tsx',
  'src/components/ui/label.tsx',
  'src/components/ui/menubar.tsx',
  'src/components/ui/navigation-menu.tsx',
  'src/components/ui/pagination.tsx',
  'src/components/ui/popover.tsx',
  'src/components/ui/progress.tsx',
  'src/components/ui/radio-group.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/scroll-area.tsx',
  'src/components/ui/select.tsx',
  'src/components/ui/separator.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/slider.tsx',
  'src/components/ui/sonner.tsx',
  'src/components/ui/switch.tsx',
  'src/components/ui/table.tsx',
  'src/components/ui/tabs.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/toaster.tsx',
  'src/components/ui/toggle-group.tsx',
  'src/components/ui/toggle.tsx',
  'src/components/ui/tooltip.tsx',
  'src/components/ui/use-toast.ts',
  'src/hooks/',
  'src/hooks/use-mobile.tsx',
  'src/hooks/use-toast.ts',
  'src/integrations/',
  'src/integrations/firebase/',
  'src/integrations/firebase/config.ts',
  'src/integrations/firebase/firebase-config.ts',
  'src/integrations/firebase/firebase-db.ts',
  'src/integrations/firebase/types.ts',
  'src/integrations/supabase/',
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
  'src/lib/',
  'src/lib/crypto.ts',
  'src/lib/utils.ts',
  'src/pages/',
  'src/pages/AccessControlPage.tsx',
  'src/pages/BarberDashboard.tsx',
  'src/pages/CreateAccountPage.tsx',
  'src/pages/ForgotPasswordPage.tsx',
  'src/pages/Index.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/ManagerDashboard.tsx',
  'src/scripts/',
  'src/scripts/update-password.cjs',
  'src/workers/',
  'src/workers/appWorker.ts',
  'supabase/',
  'supabase/config.toml'
];

let allFileContents = '';

function readFileContents(filePath) {
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      console.log('Skipping directory or non-existent file: ' + filePath);
      return '';
    }
  } catch (error) {
    console.error('Error reading file ' + filePath + ': ' + error);
    return '';
  }
}

async function processFiles() {
  for (const filePath of fileList) {
    const normalizedPath = path.normalize(filePath);
    const fullPath = path.join(__dirname, normalizedPath);

    console.log('Reading file: ' + fullPath);
    allFileContents += '\\n\\n--- FILE: ' + filePath + ' ---\\n';
    allFileContents += readFileContents(fullPath);
  }

  fs.writeFileSync('app_info.txt', allFileContents, 'utf8');
  console.log('All file contents written to app_info.txt');
}

processFiles();
