const Employee = require('../models/solicitarInsignia');

const employeeCtrl = {};

employeeCtrl.getEmployees = async (req, res, next) => {
    const employees = await Employee.find();
    res.json(employees);
};

employeeCtrl.createEmployee = async (req, res, next) => {
    const employee = new Employee({
        nombre: req.body.nombre,
        insignia: req.body.insignia,
        color: req.body.color,
        fecha:req.body.fecha,
        cum:req.body.cum,
        areaCa:req.body.areaCa,
        miniTecNudos:req.body.miniTecNudos,
        miniTecAmarres:req.body.miniTecAmarres,
        destresa1:req.body.destresa1,
        destresa2:req.body.destresa2,
        destresa3:req.body.destresa3,
        archivoEvidencia:req.body.archivoEvidencia,
        seccion:req.body.seccion
        
    });
    await employee.save();
    res.json({status: 'Employee created'});
};

employeeCtrl.getEmployee = async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    res.json(employee);
};

employeeCtrl.editEmployee = async (req, res, next) => {
    const { id } = req.params;
    const employee = {
        nombre: req.body.nombre,
        insignia: req.body.insignia,
        color: req.body.color,
        fecha:req.body.fecha,
        cum:req.body.cum,
        areaCa:req.body.areaCa,
        miniTecNudos:req.body.miniTecNudos,
        miniTecAmarres:req.body.miniTecAmarres,
        destresa1:req.body.destresa1,
        destresa2:req.body.destresa2,
        destresa3:req.body.destresa3,
        archivoEvidencia:req.body.archivoEvidencia,
        seccion:req.body.seccion
    };
    await Employee.findByIdAndUpdate(id, {$set: employee}, {new: true});
    res.json({status: 'Employee Updated'});
};

employeeCtrl.deleteEmployee = async (req, res, next) => {
    await Employee.findByIdAndRemove(req.params.id);
    res.json({status: 'Employee Deleted'});
};

module.exports = employeeCtrl;