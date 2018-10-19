module.exports = {
    CreateSimpleAnswer: function (b) {
        var s = "{\"Result\": ";
        if (b) {
            s += "\"True\"";
        } else {
            s += "\"False\"";
        }
        s += "}";
        return s;
    }
}