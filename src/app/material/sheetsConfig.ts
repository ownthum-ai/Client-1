export interface SheetColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  placeholder?: string;
}

export interface CategorySchema {
  id: string;
  name: string;
  icon: string;
  columns: SheetColumn[];
  defaultValues: Record<string, any>;
  initialData: Record<string, any>[];
}

export const CATEGORY_SCHEMAS: CategorySchema[] = [
  {
    id: 'cement',
    name: 'Cement',
    icon: '🧱',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'cementType', label: 'Cement Type', type: 'select', options: ['PPC', 'OPC', 'White Cement'] },
      { key: 'grade', label: 'Grade', type: 'select', options: ['OPC 43', 'OPC 53', 'PPC', 'N/A'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. UltraTech, ACC, Ambuja' },
      { key: 'bagWeight', label: 'Bag Weight (kg)', type: 'number' },
      { key: 'bagsCount', label: 'Bags Per Lot', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text', placeholder: 'Enter supplier name' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], cementType: 'PPC', grade: 'PPC', brand: '', bagWeight: 50, bagsCount: 100, supplier: '' },
    initialData: []
  },
  {
    id: 'steel',
    name: 'Steel',
    icon: '🏗️',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'steelType', label: 'Steel Type', type: 'text', placeholder: 'e.g. TMT Bars, Binding Wire' },
      { key: 'diameter', label: 'Diameter', type: 'select', options: ['8mm', '10mm', '12mm', '16mm', '20mm'] },
      { key: 'grade', label: 'Grade', type: 'select', options: ['Fe500D', 'Fe550D', 'Fe600'] },
      { key: 'length', label: 'Length (m)', type: 'number' },
      { key: 'weightPerRod', label: 'Weight Per Rod (kg)', type: 'number' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. TATA Tiscon, JSW' },
      { key: 'qty', label: 'Rods Count', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], steelType: 'TMT Bars', diameter: '12mm', grade: 'Fe500D', length: 12, weightPerRod: 10.6, brand: '', qty: 50, supplier: '' },
    initialData: []
  },
  {
    id: 'sand',
    name: 'Sand (Reti)',
    icon: '⏳',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'sandType', label: 'Sand Type', type: 'select', options: ['River Sand', 'M-Sand (Manufactured)', 'Plaster Sand'] },
      { key: 'source', label: 'Source', type: 'text', placeholder: 'e.g. River Bed, Crusher Site' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Brass', 'CFT'] },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'moisture', label: 'Moisture Condition', type: 'select', options: ['Dry', 'Damp', 'Wet'] },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], sandType: 'River Sand', source: 'Narmada Basin', unit: 'Brass', qty: 2, moisture: 'Damp', supplier: '' },
    initialData: []
  },
  {
    id: 'kapchi',
    name: 'Kapchi (Aggregate)',
    icon: '🪨',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'size', label: 'Aggregate Size', type: 'select', options: ['10mm', '20mm', '40mm', 'Grit'] },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Brass', 'CFT', 'Ton'] },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'source', label: 'Source', type: 'text', placeholder: 'Quarry name' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], size: '20mm', unit: 'Brass', qty: 2, source: '', supplier: '' },
    initialData: []
  },
  {
    id: 'rmc',
    name: 'RMC',
    icon: '🚛',
    columns: [
      { key: 'date', label: 'Delivery Date', type: 'date' },
      { key: 'grade', label: 'Grade', type: 'select', options: ['M20', 'M25', 'M30', 'M35', 'M40'] },
      { key: 'slump', label: 'Slump (mm)', type: 'text', placeholder: 'e.g. 120mm, 150mm' },
      { key: 'qty', label: 'Quantity (Cu.m)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text', placeholder: 'RMC Plant Supplier' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], grade: 'M25', slump: '120mm', qty: 8, supplier: '' },
    initialData: []
  },
  {
    id: 'brick',
    name: 'Brick',
    icon: '🧱',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'brickType', label: 'Brick Type', type: 'select', options: ['Red Clay Brick', 'Fly Ash Brick', 'Concrete Brick'] },
      { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. 9"x4"x3" or 230x110x75 mm' },
      { key: 'strength', label: 'Strength Grade', type: 'text', placeholder: 'e.g. Class I (7.5 N/mm²)' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Nos', 'Thousand'] },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], brickType: 'Red Clay Brick', size: '9"x4"x3"', strength: 'Class I (7.5 N/mm²)', unit: 'Nos', qty: 5000, supplier: '' },
    initialData: []
  },
  {
    id: 'block',
    name: 'Block',
    icon: '⏹️',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'blockType', label: 'Block Type', type: 'select', options: ['AAC Block', 'Solid Concrete Block', 'Hollow Block'] },
      { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. 600x200x150 mm' },
      { key: 'density', label: 'Density (kg/m³)', type: 'text', placeholder: 'e.g. 650 kg/m³' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Nos', 'Cubic Metres'] },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], blockType: 'AAC Block', size: '600x200x150 mm', density: '650 kg/m³', unit: 'Nos', qty: 1000, supplier: '' },
    initialData: []
  },
  {
    id: 'plumbing',
    name: 'Plumbing Material',
    icon: '🚰',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'materialType', label: 'Material Type', type: 'select', options: ['Pipe', 'Elbow', 'Tee', 'Valve', 'Tank'] },
      { key: 'pipeSize', label: 'Pipe Size', type: 'text', placeholder: 'e.g. 1", 1.25", 2", 110mm' },
      { key: 'pressureClass', label: 'Pressure Class', type: 'text', placeholder: 'e.g. PN16, SDR11, Schedule 40' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Astral, Supreme, Ashirvad' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], materialType: 'Pipe', pipeSize: '1.25"', pressureClass: 'SDR 11', brand: 'Astral', qty: 50, supplier: '' },
    initialData: []
  },
  {
    id: 'electrical',
    name: 'Electrical Fittings',
    icon: '⚡',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'productType', label: 'Product Type', type: 'select', options: ['Switch', 'Wire', 'MCB', 'Fan', 'Light'] },
      { key: 'wattage', label: 'Wattage / Spec', type: 'text', placeholder: 'e.g. 12W, 2.5 Sqmm, 16A' },
      { key: 'voltage', label: 'Voltage', type: 'text', placeholder: 'e.g. 230V, 1100V' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Polycab, Havells, Anchor' },
      { key: 'modelNo', label: 'Model Number', type: 'text' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], productType: 'Wire', wattage: '2.5 Sqmm', voltage: '1100V', brand: 'Polycab', modelNo: 'FR-2.5', qty: 10, supplier: '' },
    initialData: []
  },
  {
    id: 'tiles',
    name: 'Tiles',
    icon: '🔳',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'tileSize', label: 'Tile Size', type: 'select', options: ['600x600 mm', '800x800 mm', '300x600 mm', '300x300 mm'] },
      { key: 'tileType', label: 'Tile Type', type: 'select', options: ['Wall Tile', 'Floor Tile', 'Vitrified', 'Ceramic'] },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Glossy', 'Matt', 'Satin', 'High Gloss'] },
      { key: 'thickness', label: 'Thickness', type: 'text', placeholder: 'e.g. 9mm, 12mm' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Kajaria, Somany' },
      { key: 'qty', label: 'Quantity (Boxes)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], tileSize: '600x600 mm', tileType: 'Floor Tile', finish: 'Matt', thickness: '9mm', brand: 'Kajaria', qty: 100, supplier: '' },
    initialData: []
  },
  {
    id: 'stone',
    name: 'Stone',
    icon: '💎',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'stoneType', label: 'Stone Type', type: 'select', options: ['Granite', 'Marble', 'Kota', 'Sandstone'] },
      { key: 'thickness', label: 'Thickness', type: 'text', placeholder: 'e.g. 18mm, 20mm' },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Polished', 'Honed', 'Leathered', 'Lapatro'] },
      { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. Slabs, 2x2 feet, Cut-size' },
      { key: 'qty', label: 'Quantity (Sqft)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], stoneType: 'Granite', thickness: '18mm', finish: 'Polished', size: 'Slabs', qty: 500, supplier: '' },
    initialData: []
  },
  {
    id: 'tileChemical',
    name: 'Tile Chemical',
    icon: '🧪',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'chemicalType', label: 'Chemical Type', type: 'select', options: ['Tile Adhesive', 'Grout', 'Epoxy Grout', 'Waterproofing Care'] },
      { key: 'coverageArea', label: 'Coverage Area', type: 'text', placeholder: 'e.g. 50-60 sqft per bag' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. MYK Laticrete, Roff' },
      { key: 'packingSize', label: 'Packing Size', type: 'text', placeholder: 'e.g. 20 kg, 5 kg' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], chemicalType: 'Tile Adhesive', coverageArea: '55 sqft/bag', brand: 'MYK Laticrete', packingSize: '20 kg', qty: 50, supplier: '' },
    initialData: []
  },
  {
    id: 'blockChemical',
    name: 'Block Chemical',
    icon: '⚗️',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'chemicalType', label: 'Chemical Type', type: 'select', options: ['AAC Block Adhesive', 'Jointing Mortar', 'AAC Coating'] },
      { key: 'coverageArea', label: 'Coverage Area', type: 'text', placeholder: 'e.g. 100-120 sqft/bag' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Ultratech, Birla Aerocon' },
      { key: 'packingSize', label: 'Packing Size', type: 'text', placeholder: 'e.g. 40 kg, 30 kg' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], chemicalType: 'AAC Block Adhesive', coverageArea: '110 sqft/bag', brand: 'Birla Aerocon', packingSize: '40 kg', qty: 80, supplier: '' },
    initialData: []
  },
  {
    id: 'windowSection',
    name: 'Window Section',
    icon: '🪟',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'materialType', label: 'Material Type', type: 'select', options: ['Aluminium', 'UPVC', 'Wooden Section'] },
      { key: 'sectionSeries', label: 'Section Series', type: 'text', placeholder: 'e.g. Domal 40, Slide 2.5-Track' },
      { key: 'thickness', label: 'Thickness', type: 'text', placeholder: 'e.g. 1.5mm, 1.6mm' },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Powder Coated', 'Anodized Silver', 'Wood Grain Finish'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Jindal, Fenesta' },
      { key: 'qty', label: 'Quantity (Kg / Pcs)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], materialType: 'Aluminium', sectionSeries: 'Domal 40 Series', thickness: '1.5mm', finish: 'Powder Coated', brand: 'Jindal', qty: 150, supplier: '' },
    initialData: []
  },
  {
    id: 'doorSection',
    name: 'Door Section',
    icon: '🚪',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'doorType', label: 'Door Type', type: 'select', options: ['Wooden Door', 'WPC Door', 'Metal Safety Door', 'Glass Panel Door'] },
      { key: 'material', label: 'Material Details', type: 'text', placeholder: 'e.g. Teak wood, Solid Core, WPC' },
      { key: 'thickness', label: 'Thickness', type: 'text', placeholder: 'e.g. 32mm, 35mm, 40mm' },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Veneer Polished', 'Laminate Finish', 'Painted Gloss/Matt', 'Powder Coated'] },
      { key: 'qty', label: 'Quantity (Nos)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], doorType: 'Wooden Door', material: 'Pinewood Core Flush', thickness: '35mm', finish: 'Laminate Finish', qty: 20, supplier: '' },
    initialData: []
  },
  {
    id: 'fireMaterial',
    name: 'Fire Material',
    icon: '🔥',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'materialType', label: 'Material Type', type: 'select', options: ['Sprinkler', 'Hydrant', 'Smoke Detector', 'Fire Extinguisher', 'Hose Reel'] },
      { key: 'fireRating', label: 'Fire Rating', type: 'text', placeholder: 'e.g. 2 Hours, UL Listed' },
      { key: 'capacity', label: 'Capacity / Specifications', type: 'text', placeholder: 'e.g. 6 Kg, 150 GPM, 68°C rating' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Ceasefire, Honeywell, Safex' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], materialType: 'Sprinkler', fireRating: 'UL Listed', capacity: '68°C Pendent', brand: 'Safex', qty: 100, supplier: '' },
    initialData: []
  },
  {
    id: 'colorMaterial',
    name: 'Color Material (Paint)',
    icon: '🎨',
    columns: [
      { key: 'date', label: 'Entry Date', type: 'date' },
      { key: 'paintType', label: 'Paint Type', type: 'select', options: ['Primer', 'Putty', 'Emulsion', 'Texture Paint', 'Weathercoat'] },
      { key: 'finish', label: 'Finish', type: 'select', options: ['Matt', 'Glossy', 'Sheen', 'Satin', 'Semi-Gloss'] },
      { key: 'coverageArea', label: 'Coverage Area', type: 'text', placeholder: 'e.g. 130 sqft/ltr (2 coats)' },
      { key: 'shadeCode', label: 'Shade Code', type: 'text', placeholder: 'e.g. Apex White 0912' },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Asian Paints, Berger, Nerolac' },
      { key: 'packingSize', label: 'Packing Size', type: 'select', options: ['20 Ltr', '10 Ltr', '4 Ltr', '1 Ltr', '20 Kg', '40 Kg'] },
      { key: 'qty', label: 'Quantity (Buckets/Bags)', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' }
    ],
    defaultValues: { date: new Date().toISOString().split('T')[0], paintType: 'Emulsion', finish: 'Sheen', coverageArea: '130 sqft/Ltr', shadeCode: 'Royale White 0912', brand: 'Asian Paints', packingSize: '20 Ltr', qty: 20, supplier: '' },
    initialData: []
  }
];
