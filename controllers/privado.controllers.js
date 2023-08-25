import Movimiento from '../models/movimientos.js';
import Stock from '../models/stock.js'
import Medicamento from '../models/medicamentos.js'
import stock from '../models/stock.js';

export const createSalidaPriv = async (req, res) => {
    const data = req.body;
  
    console.log(data);
    const fecha = new Date(); 
    let stocke = 0;
    let stocka = 0;
    let caducidad = new Date();


    try {
       
            const movimiento = new Movimiento({
               user: req.user.idUser,
                fecha: fecha,
                tipo: 'Entrada',
                medicamentos: data.medicamentos,
                to: 'Almacen',
                from: 'Privado',
                quien: req.user.nombre,
            });
    

            const movimientoGuardado = await movimiento.save();

            const movimientoId = movimientoGuardado._id; 

    let array = data.medicamentos
           
    console.log(array);
    array.forEach(async (medicamento) => {
        let cantidad = medicamento.cantidad;
        
      
    const busco = await Medicamento.findOne({nombre:medicamento.nombre});
            const medId = busco._id;

          
            const tipo = 'Salida';
            const buscoStock = await Stock.aggregate([
                {$match: {stockPriv: { $exists: true, $ne: null }}},
                {$sort: {fecha: -1}},
                {$limit: 1}
                    ]);
                   stocke = parseFloat(buscoStock[0].stockPriv) - parseFloat(cantidad);
                    caducidad = buscoStock[0].caducidad;
            console.log(stocke)
            const buscoStockAl = await Stock.aggregate([
                {$match:{medId: medId, stock: { $exists: true, $ne: null }}},
                {$sort: {fecha: -1}},
                {$limit: 1}
                    ]);
                    if(buscoStockAl.length === 0 || !buscoStockAl || buscoStockAl === undefined){
                        stocka = cantidad;
                    }else{
                        stocka = parseFloat(buscoStockAl[0].stock) + parseFloat(cantidad);
                    }


            const nuevoStocke = new Stock({
                medId: medId,
                centro: 'Privado',
                tipo: tipo,
                cantidad: Number(cantidad),
                stockPriv: Number(stocke),
                fecha: fecha,
                stock: Number(stocka),
                caducidad: new Date(caducidad),
                movId: movimientoId
              });
              console.log(nuevoStocke);
                await nuevoStocke.save();   
             
            });     

        res.status(201).json({ message: 'Movimiento creado correctamente' });    


    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}


export const createEntradaPriv = async (req, res) => {
    const data = req.body;
    console.log(data);
    const fecha = new Date(); 
    

    try {
       
            const movimiento = new Movimiento({
                user: req.user.idUser,
                fecha: fecha,
                tipo: 'Entrada',
                medicamentos: data.medicamentos,
                from: 'Compra',
                to: 'Privado',
                quien: req.user.nombre,
            });
    

 const movimien = await movimiento.save();
                let movId = movimien._id;
    let array = data.medicamentos
            let stocke = 0;
    console.log(array);
    array.forEach(async (medicamento) => {
        const cantidad = medicamento.cantidad;
        const caducidad = new Date(medicamento.caducidad);
    const busco = await Medicamento.findOne({nombre:medicamento.nombre});
            const medId = busco._id;
        

            const tipo = 'Entrada';
    const buscoStock = await Stock.aggregate([
        {$match:{medId: medId, stockPriv: { $exists: true, $ne: null }}},
        {$sort: {fecha: -1}},
        {$limit: 1}
            ]);
            let stocke = cantidad;

            if (buscoStock && buscoStock.length > 0 && buscoStock[0].stock !== undefined) {
                stocke = parseFloat(buscoStock[0].stock) + parseFloat(cantidad);
            }

    console.log(stocke)
    const nuevoStock = new Stock({
        medId: medId,
        centro: 'Privado',
        tipo: tipo,
        cantidad: Number(cantidad),
        stockPriv: Number(stocke),
        fecha: fecha,
        caducidad: caducidad,
        movId: movId
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

export const createInventarioPriv = async (req, res) => {
 
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
            from: 'Privado',
            to: 'Privado',
            quien: req.user.nombre,
               });
               console.log(movimiento);
    
    
           const movimien = await movimiento.save();
                   let movId = movimien._id;
    
        const result = await Stock.aggregate([
            {$match: {stockPriv:{$exists: true,$ne: null  }}}, // Filtrar por centro
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
                    stockPriv: 1,
                    caducidad: 1,
                    nombre: '$medicamento.nombre',
                }},
                {$match: {stockPriv: {$gt: 0}}},
                {$sort:{nombre: 1}}
        ]);
      
          console.log(result);
            result.forEach(async (medicamento) => {
                const stockPriv = 0;
                const cantidad = 0;
                const caducidad = new Date();
                const tipo = 'Inventario';
                const medId = medicamento.medId;
                const centro = 'Privado';
                
    
                const nuevoStock = new Stock({
                    medId: medId,
                    centro: centro,
                    tipo: tipo,
                    cantidad: Number(cantidad),
                    stockPriv: Number(stock),
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
                   centro: 'Privado',
                   tipo: tipo,
                   cantidad: Number(cantidad),
                   stockPriv: Number(cantidad),
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

 export const ListaMedicamentosPriv = async (req, res) => {
            try {
                const medicamentos = await Stock.aggregate([
                  {
                    $match: {stockPriv: {$exists: true , $ne: null}}}, 
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
                        movId: '$latestEntry.movId',
                     } },
                    //  {$match: {stockPriv: {$gt: 0}}},
                    
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
                            stockPriv: 1,
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

        export const balancePriv = async (req, res) => {
            // Obtener la suma de salidas y la última entrada por cada medicamento
            try {
             let lastInventory = await Stock.findOne({ tipo: 'Inventario', centro: 'Privado' }, {}, { sort: { fecha: -1 } });
            
              
                  console.log(lastInventory);
                  console.log('lastInventory')
                  console.log(lastInventory.fecha)
                const balancete = await Stock.aggregate([
                    {
                      $match: {
                        centro: 'Privado',fecha: { $gte: lastInventory.fecha }
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
                        salidas: { $sum: { $cond: [{ $eq: ['$_id.tipo', 'Salida'] }, '$cantidad', 0] } }, // Suma de salidas
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