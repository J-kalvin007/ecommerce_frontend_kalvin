const fs = require('fs');
const path = require('path');
const file = 'app/(storefront)/commandes/components/CommandesClient.tsx';
const fullPath = path.join(process.cwd(), file);
if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('src={item.image}')) {
        content = content.replace(/src=\{item\.image\}/g, 'src={mediaUrl(item.image) || "/placeholder.png"}');
        if (!content.includes('import { mediaUrl }')) {
            content = content.replace(/import \{?[^;]+;/i, match => 'import { mediaUrl } from "@/lib/mediaUrl";\n' + match);
        }
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', file);
    }
}
