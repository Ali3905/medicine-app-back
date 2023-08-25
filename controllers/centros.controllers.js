import Centro from '../models/centros.js';
import Stock from '../models/stock.js';
import Movimiento from '../models/movimientos.js';
import Medicamento from '../models/medicamentos.js';
import mongoose from 'mongoose';



export const getCentros = async (req, res) => {
    try {
        const centros = await Centro.find();
        res.status(200).json(centros);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const createCentro = async (req, res) => {
    const centro = req.body;
    const newCentro = new Centro(centro);
    try {
        await newCentro.save();
        res.status(201).json(newCentro);
    } catch (error) {
        res.status(409).json({message: error.message});
    }
}


export const actCentro = async (req, res) => {
    const {id: _id} = req.params;
    const centro = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No existe el centro con ese id');

    const updatedCentro = await Centro.findByIdAndUpdate(_id, {...centro, _id}, {new: true});

    res.json(updatedCentro);
}

export const getMovimientosCentros = async (req, res) => {
    const centroSelected = req.params;
 
    const centro = centroSelected.centro
    console.log(centro)
    try {
        const movimientos = await Movimiento.find({ to: centro}).sort({fecha: -1});
        
        console.log(movimientos);

        res.status(200).json(movimientos);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const getStockMovSelec = async (req, res) => {
 
    const {id: _id} = req.params;
   
    const objectId = new mongoose.Types.ObjectId(_id);
   
    try {
        const stock = await Stock.aggregate([
        {$match: {movId: objectId}},
        {$lookup: {
            from: 'medicamentos',
            localField: 'medId',
            foreignField: '_id',
            as: 'medicamento',
            },
        },
        {
            $unwind: '$medicamento',
        },
        {
            $project: {
                medId: 1,
                cantidad: 1,
                fecha: 1,
                tipo: 1,
                centro: 1,
                stock: 1,
                caducidad: 1,
                nombre: '$medicamento.nombre',
            }},
        ]);
        console.log(stock);
        res.status(200).json(stock);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}


export const getMonthlyStockByMedicine = async (req, res) => {
    const centroSelected = req.params;
    const centro = centroSelected.centro;
  
    try {
  
        const monthlyStock = await Stock.aggregate([
            {
              $match: {
                $expr: {
                  $eq: [{ $year: "$fecha" }, { $year: new Date() }]
                },
                centro: centro
              }
            },
            {
              $lookup: {
                from: 'medicamentos',
                localField: 'medId',
                foreignField: '_id',
                as: 'medicamento'
              }
            },
            {
              $unwind: '$medicamento'
            },
            {
              $group: {
                _id: {
                  medicamento: '$medicamento.nombre',
                
                  month: { $month: '$fecha' }
                },
                totalSalida: { $sum: '$cantidad' }
              }
            },
            {
              $project: {
                _id: 0,
                medicamento: '$_id.medicamento',
               
                month: '$_id.month',
                totalSalida: 1
              }
            },
            {
                $sort: {
                  medicamento: 1,
                 
                  month: 1
                }
              }
            
          ]);
          
          // Generar meses y agregar entradas con totalSalida: 0 para los meses faltantes
          const allMonths = Array.from({ length: 12 }, (_, index) => index + 1);
         
          
        // Procesamiento de los datos
const processedData = {};

monthlyStock.forEach((stockItem) => {
  const { medicamento, month, totalSalida } = stockItem;

  if (!processedData[medicamento]) {
    processedData[medicamento] = [];
  }

  processedData[medicamento].push({
    mes: month,
    totalSalida
  });
});

Object.keys(processedData).forEach((medicamento) => {
  allMonths.forEach((month) => {
    const monthExists = processedData[medicamento].some((mes) => mes.mes === month);
    if (!monthExists) {
      processedData[medicamento].push({ mes: month, totalSalida: 0 });
    }
  });

  // Ordenar los meses numéricamente
  processedData[medicamento].sort((a, b) => parseInt(a.mes) - parseInt(b.mes));
});

const finalData = Object.keys(processedData).map((medicamento) => ({
  medicamento,
  meses: processedData[medicamento]
}));

console.log(finalData);
res.status(200).json(finalData);

          
    } catch (error) {
      console.error('Error fetching monthly stock:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  
  
  
  
  
  
  

// Uso de la función para obtener el stock mensual por medicamento

