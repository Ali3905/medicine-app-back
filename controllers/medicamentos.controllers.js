import Medicamento from '../models/medicamentos.js';
import mongoose from 'mongoose';
import Stock from '../models/stock.js';


export const getMedicamentos = async (req, res) => {
    try {
        const medicamentos = await Stock.aggregate([
          {
            $match: {tipo:{ $ne: 'Dispensado'}}, // Buscar solo los registros que no sean de tipo 'Dispensado
          },
            {
                $sort: {
                  medId: 1, // Ordenar por medId para asegurarnos de que los registros del mismo medId estén juntos
                  fecha: -1, // Ordenar por fecha en orden descendente
                },
              },
              {
                $group: {
                  _id: '$medId', // Agrupar por medId
                  latestEntry: { $first: '$$ROOT' }, // Tomar el primer documento dentro de cada grupo
                },
            },
            {
              $project: {
                _id: 0, // No incluir el campo _id en el resultado final
                medId: '$latestEntry.medId',
                cantidad: '$latestEntry.cantidad',
                fecha: '$latestEntry.fecha',
                tipo: '$latestEntry.tipo',
                centro: '$latestEntry.centro',
                stock: '$latestEntry.stock',
                caducidad: '$latestEntry.caducidad',
                movId: '$latestEntry.movId',
             } },
              {$match: {stock: {$gt: 0}}},
            
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
                    movId: 1,
                }},
        ]);
        console.log(medicamentos);
        res.status(200).json(medicamentos);
    } catch (error) {
        res.status(404).json({message: error.message});
    }
}

export const createMedicamento = async (req, res) => {
    const medicamento = req.body;
    const nombre = medicamento.nombre.toLowerCase();
    const descripcion = medicamento.descripcion;
    const categoria = medicamento.categoria.toLowerCase();
    console.log(medicamento);
   
    try {
        const newMedicamento = new Medicamento({nombre, descripcion, categoria,
            activo: true, stock: 0, caducidad: new Date()});
            

        await newMedicamento.save();

        res.status(201).json({ message: 'Movimiento creado correctamente' });    

    } catch (error) {
        res.status(409).json({message: error.message});
    }
}


export const encontrarMedicamento = async (req, res) => {
  const { id: _id } = req.params;

  try {
    const objectId = mongoose.Types.ObjectId.createFromHexString(_id);

    const medicamento = await Medicamento.findById(objectId);

    if (!medicamento) {
      return res.status(404).send('No existe un medicamento con ese id');
    }

    res.json(medicamento);
  } catch (error) {
    console.error('Error buscando el medicamento:', error);
    res.status(500).send('Error interno del servidor');
  }
};

export const actFechaCad =  (req, res) => {
     const fecha = new Date();
        const medicamento= req.body;
       const camMedicamento = new Stock({
            medId: medicamento.medId,
            centro: medicamento.centro,
            tipo: medicamento.tipo,
            cantidad: medicamento.cantidad,
            stock: medicamento.stock,
            fecha: fecha,
            caducidad: medicamento.caducidad,
            movId: medicamento.movId  
        });
        camMedicamento.save();
     
        console.log(medicamento);
}

export const buscarMedicamentos = async (req, res) => {
    const nombre = req.params; // Accede al valor del parámetro "q"
  const searchTerm = nombre.nombre;
    
    if (typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Invalid search term' });
      }
    try {
      // Utilizamos una expresión regular para hacer la búsqueda insensible a mayúsculas/minúsculas
      const searchTermLower = searchTerm.toLowerCase();
      const result = await Medicamento.find({}).sort({ nombre: 1 });
  
      console.log(searchTermLower);
      console.log(result);
  
      const response = result.filter((medicamento) => {
        return medicamento.nombre.toLowerCase().startsWith(searchTermLower);
      }).map((medicamento) => {
        return {
          _id: medicamento._id,
          nombre: medicamento.nombre,
        };
      });

  
      res.json(response);
    } catch (error) {
      console.error('Error searching for medicines:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  export const buscarMedicamentosS = async (req, res) => {
    const nombre = req.params; // Accede al valor del parámetro "q"
  const centro = req.params;
    const searchTerm = nombre.nombre;
  const centroSe = centro.centro;
    
    if (typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Invalid search term' });
      }
    try {
      // Utilizamos una expresión regular para hacer la búsqueda insensible a mayúsculas/minúsculas
      const searchTermLower = searchTerm.toLowerCase();
      const result = await Stock.aggregate([
        {
          $match: {tipo:{ $ne: 'Dispensado'}} // Buscar solo los registros que no sean de tipo 'Dispensado
        },
        {
            $sort: {
              medId: 1, // Ordenar por medId para asegurarnos de que los registros del mismo medId estén juntos
              fecha: -1, // Ordenar por fecha en orden descendente
            },
          },
          {
            $group: {
              _id: '$medId', // Agrupar por medId
              latestEntry: { $first: '$$ROOT' }, // Tomar el primer documento dentro de cada grupo
            },
        },
        {
          $project: {
            _id: 0, // No incluir el campo _id en el resultado final
            medId: '$latestEntry.medId',
            cantidad: '$latestEntry.cantidad',
            fecha: '$latestEntry.fecha',
            tipo: '$latestEntry.tipo',
            centro: '$latestEntry.centro',
            stock: '$latestEntry.stock',
            caducidad: '$latestEntry.caducidad',
          },
        },
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
                categoria: '$medicamento.categoria',
                nombre: '$medicamento.nombre',
            }},
            {$match: {stock: {$gt: 0}, categoria: { $in: [centroSe] } }},
            {$sort:{nombre: 1}}
    ]);
  
      console.log(searchTermLower);
      console.log(result);
  
      const response = result.filter((medicamento) => {
        return medicamento.nombre.toLowerCase().startsWith(searchTermLower);
      }).map((medicamento) => {
        return {
          _id: medicamento.medId,
          nombre: medicamento.nombre,
          stock: medicamento.stock,
        };
      });

  
      res.json(response);
    } catch (error) {
      console.error('Error searching for medicines:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const buscarMedicamentosHdD = async (req, res) => {
    const nombre = req.params; // Accede al valor del parámetro "q"

    const searchTerm = nombre.nombre;

    
    if (typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Invalid search term' });
      }
    try {
      // Utilizamos una expresión regular para hacer la búsqueda insensible a mayúsculas/minúsculas
      const searchTermLower = searchTerm.toLowerCase();
      const result = await Stock.aggregate([
        {
          $match: {
            centro: 'Farmacia',
            stockHdd: { $exists: true, $ne: null } // Filtrar por documentos que tengan el campo stockHdd
          }
        },
      {
            $sort: {
              medId: 1, // Ordenar por medId para asegurarnos de que los registros del mismo medId estén juntos
              fecha: -1, // Ordenar por fecha en orden descendente
            },
          },
          {
            $group: {
              _id: '$medId', // Agrupar por medId
              latestEntry: { $first: '$$ROOT' }, // Tomar el primer documento dentro de cada grupo
            },
        },
        {
          $project: {
            _id: 0, // No incluir el campo _id en el resultado final
            medId: '$latestEntry.medId',
            cantidad: '$latestEntry.cantidad',
            fecha: '$latestEntry.fecha',
            tipo: '$latestEntry.tipo',
            centro: '$latestEntry.centro',
            stock: '$latestEntry.stock',
            caducidad: '$latestEntry.caducidad',
            stockHdd: '$latestEntry.stockHdd'
          },
        },
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
              stockHdd: 1,
              caducidad: 1,
              categoria: '$medicamento.categoria',
              nombre: '$medicamento.nombre',
          }},
            
            {$match: {stockHdd: {$gt: 0} }},
            {$sort:{nombre: 1}}
         
    ]);
  
      console.log(searchTermLower);
      console.log('resultadoooo')
      console.log(result);
  
      const response = result.filter((medicamento) => {
        return medicamento.nombre.toLowerCase().startsWith(searchTermLower);
      }).map((medicamento) => {
        return {
          _id: medicamento.medId,
          nombre: medicamento.nombre,
          stockHdd: medicamento.stockHdd,
        };
      });

  
      res.json(response);
    } catch (error) {
      console.error('Error searching for medicines:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const buscarMedicamentosPriv = async (req, res) => {
    const nombre = req.params; // Accede al valor del parámetro "q"

    const searchTerm = nombre.nombre;

    
    if (typeof searchTerm !== 'string') {
        return res.status(400).json({ error: 'Invalid search term' });
      }
    try {
      // Utilizamos una expresión regular para hacer la búsqueda insensible a mayúsculas/minúsculas
      const searchTermLower = searchTerm.toLowerCase();
      const result = await Stock.aggregate([
        {
          $match: {
       
            stockPriv: { $exists: true, $ne: null } // Filtrar por documentos que tengan el campo stockHdd
          }
        },
      {
            $sort: {
              medId: 1, // Ordenar por medId para asegurarnos de que los registros del mismo medId estén juntos
              fecha: -1, // Ordenar por fecha en orden descendente
            },
          },
          {
            $group: {
              _id: '$medId', // Agrupar por medId
              latestEntry: { $first: '$$ROOT' }, // Tomar el primer documento dentro de cada grupo
            },
        },
        {
          $project: {
            _id: 0, // No incluir el campo _id en el resultado final
            medId: '$latestEntry.medId',
            cantidad: '$latestEntry.cantidad',
            fecha: '$latestEntry.fecha',
            tipo: '$latestEntry.tipo',
            centro: '$latestEntry.centro',
            stockPriv: '$latestEntry.stockPriv',
            caducidad: '$latestEntry.caducidad',
          },
        },
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
              stock: 1,
              stockPriv: 1,
              caducidad: 1,
              categoria: '$medicamento.categoria',
              nombre: '$medicamento.nombre',
          }},
            
            {$match: {stockPriv: {$gt: 0} }},
            {$sort:{nombre: 1}}
         
    ]);
  
      console.log(searchTermLower);
      console.log('resultadoooo')
      console.log(result);
  
      const response = result.filter((medicamento) => {
        return medicamento.nombre.toLowerCase().startsWith(searchTermLower);
      }).map((medicamento) => {
        return {
          _id: medicamento.medId,
          nombre: medicamento.nombre,
          stockPriv: medicamento.stockPriv,
        };
      });

  
      res.json(response);
    } catch (error) {
      console.error('Error searching for medicines:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
