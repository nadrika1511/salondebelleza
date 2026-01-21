#!/bin/bash
set -e

echo "🔧 Aplicando TODOS los cambios finales a Orders.jsx"
echo ""

cd /workspaces/salondebelleza/appsalonbelleza

# BACKUP antes de modificar
cp src/pages/Orders.jsx src/pages/Orders.jsx.before_final
echo "✅ Backup creado: Orders.jsx.before_final"

# 1. Agregar stylistId a productToAdd estado
echo "1. Agregando stylistId a productToAdd..."
sed -i '/const \[productToAdd, setProductToAdd\] = useState({$/,/});$/c\
  const [productToAdd, setProductToAdd] = useState({\
    productId: '"'"''"'"',\
    stylistId: '"'"''"'"',\
    quantity: 1\
  });' src/pages/Orders.jsx

# 2. Agregar stylistId a packageToAdd estado  
echo "2. Agregando stylistId a packageToAdd..."
sed -i '/const \[packageToAdd, setPackageToAdd\] = useState({$/,/});$/c\
  const [packageToAdd, setPackageToAdd] = useState({\
    packageId: '"'"''"'"',\
    stylistId: '"'"''"'"',\
    quantity: 1\
  });' src/pages/Orders.jsx

# 3. Agregar función canPayWithPackage antes de handleCloseOrder
echo "3. Agregando validación canPayWithPackage..."
LINE=$(grep -n "const handleCloseOrder = " src/pages/Orders.jsx | head -1 | cut -d: -f1)
if [ ! -z "$LINE" ]; then
  sed -i "${LINE}i\\
  const canPayWithPackage = () => {\\
    if (!editedOrder) return false;\\
    const hasPackagesSold = (editedOrder.packagesSold || []).length > 0;\\
    const hasServices = (editedOrder.services || []).some(s => s.selected);\\
    const hasProducts = (editedOrder.products || []).length > 0;\\
    return hasPackagesSold && !hasServices && !hasProducts;\\
  };\\
\\
" src/pages/Orders.jsx
fi

echo ""
echo "✅ CAMBIOS BÁSICOS APLICADOS"
echo "🔄 Ahora edita manualmente el JSX para agregar dropdowns de estilistas"
