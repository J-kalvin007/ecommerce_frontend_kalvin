const fs = require('fs');
const path = require('path');

function updateFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const [from, to] of Object.entries(replacements)) {
        if (content.includes(from)) {
            content = content.split(from).join(to);
            changed = true;
        }
    }
    if (changed) {
        if (!content.includes('import { mediaUrl }')) {
            content = content.replace(/import \{?[^;]+;/i, match => 'import { mediaUrl } from "@/lib/mediaUrl";\n' + match);
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

updateFile('app/(storefront)/components/HomeTrendingProducts.tsx', {
    'src={mainImage}': 'src={mediaUrl(mainImage) || "/placeholder.png"}',
    'src={imageUrl}': 'src={mediaUrl(imageUrl) || "/placeholder.png"}'
});

updateFile('app/(storefront)/components/HomePromotionsSection.tsx', {
    'src={banner.image_url}': 'src={mediaUrl(banner.image_url) || "/placeholder.png"}'
});

updateFile('app/(storefront)/components/AgriShowcaseSection.tsx', {
    'src={banner.image_url}': 'src={mediaUrl(banner.image_url) || "/placeholder.png"}'
});

updateFile('app/(storefront)/promotions/components/PromoOfferCard.tsx', {
    'src={imageSrc}': 'src={mediaUrl(imageSrc) || "/placeholder.png"}'
});

updateFile('app/(storefront)/promotions/components/PromoCodesCarousel.tsx', {
    'src={promoImage}': 'src={mediaUrl(promoImage) || "/placeholder.png"}'
});

updateFile('app/(storefront)/commandes/components/PannierProduits.tsx', {
    'src={item.image}': 'src={mediaUrl(item.image) || "/placeholder.png"}'
});
