const db = require("../models");
const Order = db.order;
const Customer = db.customer;
const User = db.user;
const { Op } = require('sequelize');

exports.getDetails = async(req, res) => {
    try{
        const users = await User.count()
        const admins = await User.count({ where: { role: 1}});
        const clerks = await User.count({ where: { role: 2}});
        const deliveryBoys = await User.count({ where: { role: 3}});
        const customers = await Customer.count()
        const pendingOrders = await Order.count({ where: { status: "pending"}});
        const progressOrders = await Order.count({ where: { status: "progress"}});
        const deliveredOrders = await Order.count({ where: { status: "delivered"}});
        const deliveryInTimeCount = await Order.count({ where: { isDeliveredInTime: 1}});
        const ordersAmount = await Order.sum('cost')
        res.send({
            users,
            admins,
            clerks,
            deliveryBoys,
            customers,
            pendingOrders,
            progressOrders,
            deliveredOrders,
            deliveryInTimeCount,
            ordersAmount,
        })
    }
    catch(e) {
        res.status(500).send({
            message:
            e.message || "Some error occurred while generating report.",
        });
    }
}

exports.getLastWeekOrders = async (req, res) => {
    try{
        lastWeekReport = await this.getLastWeekReport()
        res.send(lastWeekReport)
    }
    catch(e){
        res.status(500).send({
            message:
            e.message || "Some error occurred while generating report.",
        });
    }
}


exports.getLastWeekReport = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
 
    const condition = {
    createdAt: {
        [Op.between]: [oneWeekAgo, new Date()],
    },
    };

    const pendingReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'PENDING',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true,
    });

    const progressReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'PROGRESS',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true,
    });

    const deliveredReport = await db.order.findAll({
    where: {
        ...condition,
        status: 'DELIVERED',
    },
    attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('delivered_at')), 'date'],
        [db.sequelize.fn('COUNT', '*'), 'count'],
    ],
    group: [db.sequelize.fn('DATE', db.sequelize.col('delivered_at'))],
    raw: true,
    });

    const mergedReport = mergeReports(pendingReport, progressReport, deliveredReport);
    return mergedReport
 };
 
 function mergeReports(pending, progress, delivered) {
   const merged = [];
 
   pending.forEach((item) => {
     const date = item.date;
     const pendingCount = item.count;
     const progressCount = findCountByDate(progress, date);
     const deliveredCount = findCountByDate(delivered, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
   });
 
   progress.forEach((item) => {
     const date = item.date;
     const progressCount = item.count;
     const pendingCount = findCountByDate(pending, date);
     const deliveredCount = findCountByDate(delivered, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     // Check if the date is already processed in the pending loop
     const existingItem = merged.find((item) => item.date === date);
     if (!existingItem) {
       merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
     }
   });
 
   delivered.forEach((item) => {
     const date = item.date;
     const deliveredCount = item.count;
     const pendingCount = findCountByDate(pending, date);
     const progressCount = findCountByDate(progress, date);
     const total = pendingCount + progressCount + deliveredCount;
 
     // Check if the date is already processed in the pending or progress loop
     const existingItem = merged.find((item) => item.date === date);
     if (!existingItem) {
       merged.push({ date, pending: pendingCount, progress: progressCount, delivered: deliveredCount, total });
     }
   });
 
   return merged;
 }
 
 function findCountByDate(report, date) {
   const item = report.find((item) => item.date === date);
   return item ? item.count : 0;
 }
 