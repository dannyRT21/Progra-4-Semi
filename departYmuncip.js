
const departamentosYMunicipios = {
    "Ahuachapán": [
        "Ahuachapán Norte",
        "Ahuachapán Centro",
        "Ahuachapán Sur"
    ],
    "San Salvador": [
        "San Salvador Norte",
        "San Salvador Oeste",
        "San Salvador Este",
        "San Salvador Centro",
        "San Salvador Sur"
    ],
    "La Libertad": [
        "La Libertad Norte",
        "La Libertad Centro",
        "La Libertad Oeste",
        "La Libertad Este",
        "La Libertad Costa",
        "La Libertad Sur"
    ],
    "Chalatenango": [
        "Chalatenango Norte",
        "Chalatenango Centro",
        "Chalatenango Sur"
    ],
    "Cuscatlán": [
        "Cuscatlán Norte",
        "Cuscatlán Sur"
    ],
    "Cabañas": [
        "Cabañas Este",
        "Cabañas Oeste"
    ],
    "La Paz": [
        "La Paz Oeste",
        "La Paz Centro",
        "La Paz Este"
    ],
    "La Unión": [
        "La Unión Norte",
        "La Unión Sur"
    ],
    "Usulután": [
        "Usulután Norte",
        "Usulután Este",
        "Usulután Oeste"
    ],
    "Sonsonate": [
        "Sonsonate Norte",
        "Sonsonate Centro",
        "Sonsonate Este",
        "Sonsonate Oeste"
    ],
    "Santa Ana": [
        "Santa Ana Norte",
        "Santa Ana Centro",
        "Santa Ana Este",
        "Santa Ana Oeste"
    ],
    "San Vicente": [
        "San Vicente Norte",
        "San Vicente Sur"
    ],
    "San Miguel": [
        "San Miguel Norte",
        "San Miguel Centro",
        "San Miguel Oeste"
    ],
    "Morazán": [
        "Morazán Norte",
        "Morazán Sur"
    ]
};
window.addEventListener('DOMContentLoaded', () => {
    const selectDepartamento = document.getElementById('selectDepartamento');
    Object.keys(departamentosYMunicipios).forEach(departamento => {
        const option = document.createElement('option');
        option.value = departamento;
        option.textContent = departamento;
        selectDepartamento.appendChild(option);
    });
});

