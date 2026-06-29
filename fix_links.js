const fs = require('fs');
const path = require('path');

function updateFile(file, replacer) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let original = content;
        content = replacer(content);
        if (content !== original) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log('Updated', file);
        }
    }
}

function ensureImport(content) {
    if (!content.includes('import { useUIStore }')) {
        content = content.replace(/import \{?[^;]+;/i, match => 'import { useUIStore } from "@/store/uiStore";\n' + match);
    }
    return content;
}

updateFile('app/(storefront)/components/HomeTrendingProducts.tsx', content => {
    content = content.replace(/<Link[\s\n]+href=\{`\/products\/\$\{product\.slug\}`\}/g, '<Link href={`/products/${product.slug}`} onClick={() => useUIStore.getState().setActiveProductId(product.id)}');
    return ensureImport(content);
});

updateFile('app/(storefront)/promotions/components/PromotionsClient.tsx', content => {
    content = content.replace(/<Link[\s\n]+href=\{`\/products\/\$\{product\.slug\}`\}/g, '<Link href={`/products/${product.slug}`} onClick={() => useUIStore.getState().setActiveProductId(product.id)}');
    return ensureImport(content);
});

updateFile('app/(storefront)/favoris/FavorisClient.tsx', content => {
    // FavorisClient uses item.slug and item.id
    content = content.replace(/<Link[\s\n]+href=\{`\/products\/\$\{item\.slug\}`\}/g, '<Link href={`/products/${item.slug}`} onClick={() => useUIStore.getState().setActiveProductId(item.id)}');
    return ensureImport(content);
});

updateFile('app/(storefront)/commandes/components/PannierProduits.tsx', content => {
    // PannierProduits uses item.slug and item.id
    content = content.replace(/<Link[\s\n]+href=\{`\/products\/\$\{item\.slug\}`\}/g, '<Link href={`/products/${item.slug}`} onClick={() => useUIStore.getState().setActiveProductId(item.id)}');
    return ensureImport(content);
});

updateFile('app/(storefront)/promotions/components/PromoOfferCard.tsx', content => {
    // PromoOfferCard uses href which is const href = `/products/${item.slug}`;
    // and the item is passed as a prop, it has an ID
    content = content.replace(/<Link href=\{href\}/g, '<Link href={href} onClick={() => useUIStore.getState().setActiveProductId(item.id)}');
    return ensureImport(content);
});
