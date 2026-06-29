const fs = require('fs');

let content = fs.readFileSync('app/(storefront)/commandes/components/PannierProduits.tsx', 'utf8');

// Fix image
content = content.replace('src={item.image}', 'src={mediaUrl(item.image) || "/placeholder.png"}');
if (!content.includes('import { mediaUrl }')) {
    content = content.replace(/import \{?[^;]+;/i, match => 'import { mediaUrl } from "@/lib/mediaUrl";\n' + match);
}

// Fix links and duplicate onClick
content = content.replace(/<Link href=\{`\/products\/\$\{item\.slug\}`\}[^>]*>/g, '<Link href={`/products/${item.slug}`} onClick={() => { useUIStore.getState().setActiveProductId(item.id); toggleDrawer(false); }} className="text-sm font-semibold leading-snug text-foreground hover:text-primary line-clamp-2">');

fs.writeFileSync('app/(storefront)/commandes/components/PannierProduits.tsx', content, 'utf8');
