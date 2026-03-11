import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '../public/prendas');
const outputDir = path.join(__dirname, '../public/opt-prendas');
const targetDataPath = path.join(__dirname, '../src/data/products.json');

// Helper para parsear "TIPO-NOMBRE-COLOR.jpg" o "TIPO-NOMBRE.jpg"
function parseFilename(filename) {
    // Quitamos la extension y modificadores como (1) o (2)
    const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '').replace(/\s*\(\d+\)\s*$/, '').trim();
    
    // Asumimos formato CATEGORIA-NOMBRE-COLOR o CATEGORIA-NOMBRE
    const parts = base.split('-');
    if (parts.length < 2) return null; // Formato invalido
    
    const category = parts[0].toUpperCase();
    let name = '';
    let color = '';

    if (parts.length === 2) {
        name = parts[1].toUpperCase();
        color = 'Único'; // Color por defecto si no especifica
    } else {
        name = parts[1].toUpperCase();
        color = parts.slice(2).join(' ').toUpperCase(); // Todo lo que sigue al nombre es el color
    }
    
    return { category, name, color, originalExt: path.extname(filename), baseName: filename };
}

async function run() {
    try {
        await fs.mkdir(outputDir, { recursive: true });
        
        const files = await fs.readdir(inputDir);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && f !== 'splash-main.jpg');
        
        console.log(`Encontradas ${imageFiles.length} imagenes para procesar...`);
        
        const productMap = new Map(); // Mapa para agrupar por "nombre"
        let currentId = 1;

        for (const file of imageFiles) {
            const parsed = parseFilename(file);
            if (!parsed) {
                console.warn(`Saltando archivo mal formateado: ${file}`);
                continue;
            }

            const inPath = path.join(inputDir, file);
            // Pasamos a formato .jpg comprimido
            const outFileName = `${parsed.category}-${parsed.name}-${parsed.color}.jpg`.replace(/\s+/g, '_');
            const outPath = path.join(outputDir, outFileName);

            let transformer = sharp(inPath);
            
            // Si es un VESTIDO, aplicamos un "zoom" center crop recortando el ~15% exterior
            // Sharp extract necesita left, top, width, height en pixeles reales.
            // Asi que primero leemos metadatos.
            if (parsed.category === 'VESTIDO') {
                const metadata = await transformer.metadata();
                if (metadata.width && metadata.height) {
                    const zoomFactor = 0.8; // Se queda con el 80% central
                    const extractWidth = Math.floor(metadata.width * zoomFactor);
                    const extractHeight = Math.floor(metadata.height * zoomFactor);
                    const left = Math.floor((metadata.width - extractWidth) / 2);
                    const top = Math.floor((metadata.height - extractHeight) / 2);
                    
                    transformer = transformer.extract({ left, top, width: extractWidth, height: extractHeight });
                }
            }

            // Redimensionar para la web (max 800px) y comprimir
            await transformer
                .resize(800, null, { withoutEnlargement: true })
                .jpeg({ quality: 80, progressive: true })
                .toFile(outPath);
            
            console.log(`✅ Procesado: ${outFileName}`);

            // Agregamos a la estructura de datos
            // Generar clave unica por modelo
            const productKey = `${parsed.category}_${parsed.name}`;
            const publicImagePath = `/opt-prendas/${outFileName}`;

            if (!productMap.has(productKey)) {
                // Precio dummy random entre 40 y 120
                const randomPrice = Math.floor(Math.random() * 80) + 40; 
                productMap.set(productKey, {
                    id: currentId++,
                    name: `${parsed.category} ${parsed.name}`,
                    category: parsed.category === 'SKORT' ? 'SKORTS' : (parsed.category + 'S').replace('SS', 'S'), // pluralize dummy
                    price: `$${randomPrice}`,
                    colors: []
                });
            }
            
            const prod = productMap.get(productKey);
            // Evitar duplicados de color si el usuario subió varias fotos (ej: (1), (2))
            if (!prod.colors.find(c => c.name === parsed.color)) {
                prod.colors.push({
                    name: parsed.color,
                    image: publicImagePath
                });
            }
        }

        // Parsear el MAP a JSON string
        const finalProductsList = Array.from(productMap.values());
        
        await fs.mkdir(path.dirname(targetDataPath), { recursive: true });
        
        const jsonContent = `// Archivo autogenerado por process_images.js
export const PRODUCTS = ${JSON.stringify(finalProductsList, null, 2)};
`;
        await fs.writeFile(targetDataPath, jsonContent);
        console.log(`\n¡Datos escritos exitosamente en ${targetDataPath} con ${finalProductsList.length} modelos unicos!`);

    } catch (e) {
        console.error("Error procesando imagenes:", e);
    }
}

run();
