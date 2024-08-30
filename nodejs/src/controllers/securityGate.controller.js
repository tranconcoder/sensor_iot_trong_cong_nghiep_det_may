export default class SecurityGateController {
    authSerialNumber(req, res, next) {
        var _a;
        console.log(Number((_a = req.body) === null || _a === void 0 ? void 0 : _a.serial_number));
    }
}
