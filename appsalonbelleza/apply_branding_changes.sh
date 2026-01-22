#!/bin/bash

echo "🔧 Aplicando cambios de branding..."
echo ""

# PASO 1: Copiar logo
echo "📥 1. Copiando logo..."
cp /home/claude/elua-logo.jpeg public/elua-logo.jpeg
echo "   ✅ Logo copiado"
echo ""

# PASO 2: Actualizar Login.jsx
echo "🔑 2. Actualizando Login.jsx..."
cat > /tmp/update_login.py << 'PYSCRIPT'
with open('src/pages/Login.jsx', 'r') as f:
    content = f.read()

# Reemplazar emoji por imagen
if '<div className="text-8xl mb-6">💇‍♀️</div>' in content:
    content = content.replace(
        '<div className="text-8xl mb-6">💇‍♀️</div>',
        '<div className="mb-6">\n            <img src="/elua-logo.jpeg" alt="Elua Salón" className="w-48 h-48 mx-auto object-contain" />\n          </div>'
    )

# Cambiar todos los títulos
content = content.replace('AppSalon Belleza', 'Elua Salón')

with open('src/pages/Login.jsx', 'w') as f:
    f.write(content)

print("   ✅ Login.jsx actualizado")
PYSCRIPT

python3 /tmp/update_login.py
echo ""

# PASO 3: Actualizar index.html
echo "📄 3. Actualizando index.html..."
sed -i 's/<title>.*<\/title>/<title>Elua Salón - Sistema de Gestión<\/title>/' index.html
echo "   ✅ index.html actualizado"
echo ""

# PASO 4: Agregar campo NIT
echo "👥 4. Agregando campo NIT en Clients.jsx..."
cat > /tmp/add_nit.py << 'PYSCRIPT'
with open('src/pages/Clients.jsx', 'r') as f:
    content = f.read()

# Agregar nit al estado
if "'clientPackages': []" in content and "'nit':" not in content:
    content = content.replace(
        "email: '',\n    clientPackages: []",
        "email: '',\n    nit: '',\n    clientPackages: []"
    )

# Agregar campo en formulario
if 'placeholder="correo@ejemplo.com"' in content and 'NIT (Opcional)' not in content:
    content = content.replace(
        '''placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Paquetes del cliente */}''',
        '''placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NIT (Opcional)
            </label>
            <input
              type="text"
              value={formData.nit}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9-]/g, '');
                setFormData({...formData, nit: value});
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="12345678-9"
              maxLength="15"
            />
          </div>

          {/* Paquetes del cliente */}'''
    )

# Agregar columna en header
if 'NIT</th>' not in content:
    content = content.replace(
        '''<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquetes</th>''',
        '''<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paquetes</th>'''
    )

# Agregar celda en body
if '{client.nit' not in content:
    content = content.replace(
        '''<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.email || '-'}
              </td>
              <td className="px-6 py-4">''',
        '''<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.email || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {client.nit || '-'}
              </td>
              <td className="px-6 py-4">'''
    )

with open('src/pages/Clients.jsx', 'w') as f:
    f.write(content)

print("   ✅ Campo NIT agregado")
PYSCRIPT

python3 /tmp/add_nit.py
echo ""

# PASO 5: Deshabilitar scroll en inputs
echo "🔢 5. Deshabilitando scroll en inputs numéricos..."
if ! grep -q "Deshabilitar scroll" src/index.css; then
    cat >> src/index.css << 'EOF'

/* Deshabilitar scroll/incremento en inputs numéricos */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
EOF
    echo "   ✅ CSS aplicado"
else
    echo "   ✅ CSS ya aplicado previamente"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TODOS LOS CAMBIOS APLICADOS:"
echo "   1. ✅ Logo 'Elua Salón' en login"
echo "   2. ✅ Título cambiado a 'Elua Salón'"
echo "   3. ✅ Campo NIT agregado en clientes"
echo "   4. ✅ Inputs numéricos sin scroll/incremento"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
