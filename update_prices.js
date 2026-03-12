import fs from 'fs';

const dataRaw = fs.readFileSync('src/data/products.json', 'utf8');
let products = JSON.parse(dataRaw);

const priceMap = {
    // VESTIDOS
    "VESTIDO HELENA FRUNCE": 23900,
    "VESTIDO HELENA": 23900,
    "VESTIDO MACA": 23900,
    "VESTIDO CLARA": 23900,
    "VESTIDO OLIVIA": 25900,
    "VESTIDO ZOE STRASS": 25900,
    "VESTIDO CORA": 27900,
    "VESTIDO ZOE": 23900,
    "VESTIDO BETTY": 21900,
    "VESTIDO MAITE": 21900,
    "VESTIDO SUSI": 23900,
    "VESTIDO ROMA": 21900,
    "VESTIDO EVA": 23900,

    // BODYS
    "BODY REBECCA": 15900,

    // CONJUNTOS (We'll separate Hanna below, but if kept as Conjunto, we set 32800 or skip. We will split it.)

    // SHORTS (including DENIM)
    "SHORT ANNA": 22900,
    "SHORT SELE": 22900,
    "SHORT LOLA": 14900,
    "SHORT MOMI": 17900,
    "SHORT RINA": 12900,
    "SHORT SARA": 11900,
    "SHORT SHINE": 11900,
    "SHORT TATI": 17900,
    "SHORT UMA": 17900,

    // SKORTS
    "SKORT ADA": 11900,
    "SKORT ISA": 17900,
    "SKORT LIA": 17900,
    "SKORT LILI": 17900,
    "SKORT LUCY": 14900,
    "SKORT MAYA": 14900,
    "SKORT MIA": 14900,
    "SKORT MILA": 19900,
    "SKORT SAMI": 16900,
    "SKORT TAMI": 17900,
    "SKORT ZARA": 11900,

    // TOPS
    "TOP ANNA": 12900,
    "TOP ARIA": 15900,
    "TOP CAMILA": 13900,
    "TOP CLEO": 11900,
    "TOP CORA": 14900,
    "TOP EMMA": 12900,
    "TOP KALI": 14900,
    "TOP LIA": 11900,
    "TOP MAR": 14900,
    "TOP MARY": 14900,
    "TOP MERI": 15900,
    "TOP ROSE": 14900,
    "TOP SOPHIA": 16900,
    "TOP TIARA": 12900,
    "TOP ZAMI": 11900,
    "TOP ZOE": 12900
};

// 1. Separate VESTIDO EVA into EVA and EVA SHINE
const evaIndex = products.findIndex(p => p.id === 43);
if (evaIndex !== -1) {
    const eva = products[evaIndex];
    const shineColor = eva.colors.find(c => c.name.includes('SHINE'));
    const unicoColor = eva.colors.find(c => c.name === 'Único');
    
    // Update EVA
    products[evaIndex].name = "VESTIDO EVA";
    products[evaIndex].price = "$23900";
    products[evaIndex].colors = [unicoColor].filter(Boolean);
    
    // Add EVA SHINE
    if (shineColor && !products.find(p => p.name === "VESTIDO EVA SHINE")) {
        products.push({
            id: 43.1,
            name: "VESTIDO EVA SHINE",
            category: "VESTIDOS",
            price: "$25900",
            colors: [shineColor]
        });
    }
}

// 2. Separate CONJUNTO HANNA into TOP HANNA and SKORT HANNA
const hannaIndex = products.findIndex(p => p.id === 2);
if (hannaIndex !== -1) {
    const hanna = products[hannaIndex];
    const newTop = JSON.parse(JSON.stringify(hanna));
    newTop.id = 2.1;
    newTop.name = "TOP HANNA";
    newTop.category = "TOPS";
    newTop.price = "$15900";
    
    const newSkort = JSON.parse(JSON.stringify(hanna));
    newSkort.id = 2.2;
    newSkort.name = "SKORT HANNA";
    newSkort.category = "SKORTS";
    newSkort.price = "$16900";
    
    // Replace Conjunto with Top and Skort
    products.splice(hannaIndex, 1, newTop, newSkort);
}

// 3. Update normal prices and colors
products.forEach(p => {
    if (priceMap[p.name]) {
        p.price = "$" + priceMap[p.name];
    }
    
    p.colors.forEach(c => {
        if (c.name.toUpperCase() === "BORDO" || c.name.toUpperCase() === "BORDÓ") {
            c.name = "UVA";
        }
        // "CHOCO" to "MARRON" mapping - user said leave it as MARRON in site.
        // I'll make sure no color is named CHOCO, or if there is, it's MARRON.
        // Actually, no "CHOCO" exists in JSON right now, it's already "MARRON" (e.g. TOP KALI MARRON),
        // but if there happens to be a "CHOCO", I'll set to "MARRON".
        if (c.name.toUpperCase() === "CHOCO") {
            c.name = "MARRON";
        }
    });

    // We also need to fix DENIM categories
    if (["SHORT ANNA", "SHORT SELE"].includes(p.name)) {
        p.category = "DENIM";
    }
});

// Sort by ID to keep it somewhat clean
products.sort((a,b) => a.id - b.id);

fs.writeFileSync('src/data/products.json', JSON.stringify(products, null, 2));
console.log("Prices and colors updated successfully.");
