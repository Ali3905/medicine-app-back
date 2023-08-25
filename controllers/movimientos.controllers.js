import Movimiento from '../models/movimientos.js';
import Medicamento from '../models/medicamentos.js';
import Stock from '../models/stock.js';





export const createSalidaAlmacen = async (req, res) => {
    const data = req.body;
  
    console.log(data);
    const fecha = new Date(); 
    const centro = data.centro; 
    let stockHdd = 0;
    let stock = 0;
    let stocke = 0;
    let caducidad = new Date();


    try {
       
            const movimiento = new Movimiento({
               user: req.user.idUser,
                fecha: fecha,
                tipo: 'Salida',
                medicamentos: data.medicamentos,
                to: centro,
                from: 'Almacen',
                quien: req.user.nombre,
            });
    

            const movimientoGuardado = await movimiento.save();
            console.log(movimientoGuardado)
            const movimientoId = movimientoGuardado._id; 

    let array = data.medicamentos
           
    console.log(array);
    array.forEach(async (medicamento) => {
        let cantidad = medicamento.cantidad;
      
    const busco = await Medicamento.findOne({nombre:medicamento.nombre});
            const medId = busco._id;

            if(centro === 'Farmacia'){
                const tipo = 'Entrada';
              
                      
                const buscoStocke = await Stock.aggregate([
                    {$match:{medId: medId, centro: 'Farmacia'}},
                    {$sort: {fecha: -1}},
                    {$limit: 1}
                        ]);

               const buscoCaducidad = await Stock.aggregate([
                     {$match:{medId: medId, stock: {$exists: true, $ne: null}}},
                     {$sort: {fecha: -1}},
                    {$limit: 1}
                       ]); 
                 caducidad = buscoCaducidad[0].caducidad;
                    stock = buscoCaducidad[0].stock;
                    stock = parseFloat(stock) - parseFloat(cantidad);
                        if(buscoStocke.length === 0 || !buscoStocke || buscoStocke === undefined){
                            stockHdd = cantidad;
                           
                          
                        }else if(buscoStocke[0].stockHdd === undefined){
                          stockHdd = cantidad;
                        }else{
                            stockHdd = parseFloat(buscoStocke[0].stockHdd) + parseFloat(cantidad);     
                        }
                    
                    const nuevoStock = new Stock({
                        medId: medId,
                        centro: 'Farmacia',
                        tipo: tipo,
                        stock: Number(stock),
                        cantidad: Number(cantidad),
                        stockHdd: Number(stockHdd),
                        fecha: fecha,
                        caducidad: new Date(caducidad),
                        movId: movimientoId
                        });
                        console.log(nuevoStock);
                        await nuevoStock.save();
            }else{
            const tipo = 'Salida';
            const buscoStock = await Stock.aggregate([
                {$match:{medId: medId, stock: {$exists: true, $ne: null}}},
                {$sort: {fecha: -1}},
                {$limit: 1}
                    ]);
                   stocke = parseFloat(buscoStock[0].stock) - parseFloat(cantidad);
                   caducidad= buscoStock[0].caducidad;
            console.log(stocke)
            const nuevoStocke = new Stock({
                medId: medId,
                centro: centro,
                tipo: tipo,
                cantidad: Number(cantidad),
                stock: Number(stocke),
                fecha: fecha,
                caducidad: new Date(caducidad),
                movId: movimientoId
              });
              console.log(nuevoStocke);
                await nuevoStocke.save();
                   
            }  
             
            });     
         
     


        res.status(201).json({ message: 'Movimiento creado correctamente' });    


    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}



export const createEntradaAlmacen = async (req, res) => {
    const data = req.body;
    console.log(data);
    const fecha = new Date(); 
     const centro = data.centro;

    try {
       
            const movimiento = new Movimiento({
               user: req.user.idUser,
                fecha: fecha,
                tipo: 'Entrada',
                medicamentos: data.medicamentos,
                from: 'Misau',
                to: 'Almacen',
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
        {$match:{medId: medId, tipo: {$ne: 'Dispensado'}}},
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
        centro: 'Almacen',
        tipo: tipo,
        cantidad: Number(cantidad),
        stock: Number(stocke),
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

export const getMovimientos = async (req, res) => {

    const allMov = await Movimiento.find({user: req.user.idUser}).populate('medicamentos.medicamento').populate('centro');


return res.json(allMov);
} 

export const createInventario = async (req, res) => {
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
        from: 'Almacen',
        to: 'Almacen',
        quien: req.user.nombre,
           });


       const movimien = await movimiento.save();
               let movId = movimien._id;

    const result = await Stock.aggregate([
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
                nombre: '$medicamento.nombre',
            }},
            {$match: {stock: {$gt: 0}}},
            {$sort:{nombre: 1}}
    ]);
  
      console.log(result);
        result.forEach(async (medicamento) => {
            const stock = 0;
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
               centro: 'Almacen',
               tipo: tipo,
               cantidad: Number(cantidad),
               stock: Number(cantidad),
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

  

        export const balanceDep = async (req, res) => {
            // Obtener la suma de salidas y la última entrada por cada medicamento
            try {
                let lastInventory = await Movimiento.findOne({ tipo: 'Inventario', to: 'Almacen' }, {}, { sort: { fecha: -1 } });
                
                    

                        const balancet = await Movimiento.aggregate([
                          {
                            $match: {
                              $or: [
                                { to: 'Almacen', tipo: 'Inventario' },
                                { from: 'Almacen', tipo: 'Salida' },
                                { to: 'Almacen', tipo: 'Entrada' }
                              ],
                              fecha: { $gte: lastInventory.fecha } // Agregar la condición de fecha
                            }
                          },
                         
                             { $lookup: {
                                from: 'stocks',
                                localField: '_id',
                                foreignField: 'movId',
                                as: 'stock'
                              }
                            },
                            {
                              $unwind: '$stock'
                            },
                            {
                              $project: {
                                _id: 0,
                                medId: '$stock.medId',
                                cantidad: '$stock.cantidad',
                                fecha: 1,
                                tipo: 1, // Agregar el tipo de movimiento al proyecto
                              }
                            },
                          {
                              $group: {
                                _id: '$medId',
                                entradas: {
                                  $sum: { $cond: [{ $eq: ['$tipo', 'Entrada'] }, '$cantidad', 0] }
                                },
                                inventario: {
                                  $sum: { $cond: [{ $eq: ['$tipo', 'Inventario'] }, '$cantidad', 0] }
                                },
                                salidas: {
                                  $sum: { $cond: [{ $eq: ['$tipo', 'Salida'] }, '$cantidad', 0] }
                                }
                              }
                            },
                        

                           {
                              $project: {
                                _id: 1,
                               
                                entradas: 1,
                                inventario: 1,
                                salidas: 1,
                                saldo: {
                                  $subtract: [
                                    { $add: ['$entradas', '$inventario'] },
                                    '$salidas'
                                  ]
                                }
                              }
                            },
                            {$lookup: {
                                from: 'medicamentos',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'medicamento'
                                }
                            },
                            {$unwind: '$medicamento'},
                           {
                                $project: {
                                    _id: 0,
                                    medicamento: '$medicamento.nombre',
                                    entradas: 1,
                                    salidas: 1,
                                    inventario: 1,
                                    saldo: 1,
                                }
                            },
   
                          ]);
                          
            res.status(200).json(balancet);
            
                  
            } catch (error) {
              console.error('Error fetching monthly stock:', error);
              res.status(500).json({ error: 'An error occurred' });
            }
            }