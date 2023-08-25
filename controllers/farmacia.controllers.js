import Movimiento from '../models/movimientos.js';
import Stock from '../models/stock.js'
import Medicamento from '../models/medicamentos.js'

export const createSalidaHdD = async (req, res) => {
    const data = req.body;
  
    console.log(data);
    const fecha = new Date(); 
    let caducidad = new Date();
    let stock = 0;
   

    try {
       
            const movimiento = new Movimiento({
               user: req.user.idUser,
                fecha: fecha,
                tipo: 'Dispensado',
                medicamentos: data.medicamentos,
                from: 'Farmacia',
                quien: req.user.nombre,
                to: 'doentes',
            });
    

            const movimientoGuardado = await movimiento.save();
            console.log(movimientoGuardado)
            const movimientoId = movimientoGuardado._id; 

    let array = data.medicamentos
            let stocke = 0;
    console.log(array);
    array.forEach(async (medicamento) => {
        const cantidad = medicamento.cantidad;
 
      
    const busco = await Medicamento.findOne({nombre:medicamento.nombre});
            const medId = busco._id;
            const tipo = 'Dispensado';
            const buscoStock = await Stock.aggregate([
                {$match:{medId: medId, centro: 'Farmacia'}},
                {$sort: {fecha: -1}},
                {$limit: 1}
                    ]);
            const buscoCaducidad = await Stock.aggregate([
                        {$match:{medId: medId, tipo: {$ne: 'Dispensado'}}},
                        {$sort: {fecha: -1}},
                        {$limit: 1}
                            ]);
                                 
                    if(buscoStock.length === 0 || !buscoStock || buscoStock === undefined){
                        caducidad = buscoCaducidad[0].caducidad;
                       
                    }else{
                   stocke = parseFloat(buscoStock[0].stockHdd) - parseFloat(cantidad);
                    caducidad= buscoStock[0].caducidad;
                }
            console.log(stocke)
            const nuevoStock = new Stock({
                medId: medId,
                centro: 'Farmacia',
                tipo: tipo,
                cantidad: Number(cantidad),
                stockHdd: Number(stocke),
                fecha: fecha,
                caducidad: new Date(caducidad),
                movId: movimientoId
              });
              console.log(nuevoStock);
                await nuevoStock.save();
                             
            });     


        res.status(201).json({ message: 'Movimiento creado correctamente' });    


    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

export const balanceteHdD = async (req, res) => {
// Obtener la suma de salidas y la última entrada por cada medicamento
try {
  let lastMovimiento = await Stock.findOne({ centro: 'Farmacia' }, {}, { sort: { fecha: -1 } ,limit:1});
 let lastInventory = await Stock.findOne({ tipo: 'Inventario', centro: 'Farmacia' }, {}, { sort: { fecha: -1 } });

  if (!lastInventory) {
      lastInventory = lastMovimiento;
  }
      console.log(lastInventory);
      console.log('lastInventory')
      console.log(lastInventory.fecha)
    const balancete = await Stock.aggregate([
        {
          $match: {
            centro: 'Farmacia',fecha: { $gte: lastInventory.fecha }
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
            $project: {
              
                cantidad: 1,
                fecha: 1,
                tipo: 1,
            
                stockHdd: 1,
                caducidad: 1,
                nombre: '$medicamento.nombre',
            }},
     {
          $group: {
            _id: {
              medicamento: '$nombre',
              tipo: '$tipo'
            },
            cantidad: { $sum: '$cantidad' } // Suma de cantidad (entrada positiva, salida negativa)
          }
        },
        {
          $group: {
            _id: '$_id.medicamento',
            entradas: { $sum: { $cond: [{ $eq: ['$_id.tipo', 'Entrada'] }, '$cantidad', 0] } }, // Suma de entradas
            salidas: { $sum: { $cond: [{ $eq: ['$_id.tipo', 'Dispensado'] }, '$cantidad', 0] } }, // Suma de salidas
            inventario: { $sum: { $cond: [{ $eq: ['$_id.tipo', 'Inventario'] }, '$cantidad', 0] } } // Suma de inventario
          }
        },
     {
          $project: {
            _id: 0,
            medicamento: '$_id',
            entradas: 1,
            salidas: 1,
            inventario: 1,
            entradasTotal: {$sum: ['$entradas', '$inventario']},
          }
        },
        {
          $addFields: {
            saldo: { $subtract: ['$entradasTotal', '$salidas'] }
          }
        },
        {
          $sort: {
            medicamento: 1
          }
        }

      ]);
      
      
      
 


console.log(balancete);
res.status(200).json(balancete);

      
} catch (error) {
  console.error('Error fetching monthly stock:', error);
  res.status(500).json({ error: 'An error occurred' });
}
}

export const createInventarioHdd = async (req, res) => {
  const data = req.body;
  console.log(data);
  const fecha = new Date(); 

  let array = data.medicamentos
 
     console.log(array);
      try {

  const movimiento = new Movimiento({
      user: req.user.idUser,
      fecha: fecha,
      tipo: 'Inventario',
      medicamentos: data.medicamentos,
      from: 'Farmacia',
      to: 'Farmacia',
      quien: req.user.nombre,
         });


     const movimien = await movimiento.save();
             let movId = movimien._id;

  const result = await Stock.aggregate([
    {$match: {centro: 'Farmacia'}}, // Filtrar por centro
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
          stockHdd: '$latestEntry.stockHdd',
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
              stockHdd: 1,
              caducidad: 1,
              nombre: '$medicamento.nombre',
          }},
          {$match: {stockHdd: {$gt: 0}}},
          {$sort:{nombre: 1}}
  ]);

      result.forEach(async (medicamento) => {
          const stockHdd = 0;
          const cantidad = 0;
          const caducidad = new Date();
          const tipo = 'Inventario';
          const medId = medicamento.medId;
          const centro = 'Almacen';
          

          const nuevoStock = new Stock({
              medId: medId,
              centro: centro,
              tipo: tipo,
              cantidad: Number(cantidad),
              stock: Number(stock),
              fecha: fecha,
              caducidad: caducidad,
              movId: null,
              });

              await nuevoStock.save();

      });


    


      array.forEach(async (medicamento) => {

       const cantidad = medicamento.cantidad;
       const caducidad = new Date(medicamento.caducidad);
       const busco = await Medicamento.findOne({nombre:medicamento.nombre});
          const medId = busco._id;
          const tipo = 'Inventario';

          const movimiento = new Stock({
            
             medId: medId,
             centro: 'Farmacia',
             tipo: tipo,
             cantidad: Number(cantidad),
             stockHdd: Number(cantidad),
             fecha: fecha,
             caducidad: caducidad,
             movId: movId,
             rol: req.user.rol
          });

          await movimiento.save();
  
           });
  }
      catch (error) {
          console.log(error);
          return res.status(500).json(error);
      }

  

      res.status(201).json({ message: 'Movimiento creado correctamente' });
  }

  export const obtenerListaHdd = async (req, res) => {
    try {
        const medicamentos = await Stock.aggregate([
          {
            $match: {stockHdd: {$exists: true , $ne: null}}}, 
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
                stockHdd: '$latestEntry.stockHdd',
                caducidad: '$latestEntry.caducidad',
                movId: '$latestEntry.movId',
             } },
             {$match: {stockHdd: {$gt: 0}}},
            
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
                    stockHdd: 1,
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
