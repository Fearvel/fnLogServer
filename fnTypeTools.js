module.exports = {
    GetDateTimeNow: function () {
        var currentdate = new Date();
        var datetime =
            +currentdate.getFullYear() + "-"
            + (currentdate.getMonth() + 1) + "-"
            + currentdate.getDate() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        return datetime;
    },
    
    IsNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    TransformToJson: function (s) {
        s = "{\n\t\"" + s;
        while (s.includes("=")) {
            s = s.replace("=", "\": \"");
        }
        while (s.includes("\&")) {
            s = s.replace("\&", "\",\n\t\"");
        }
        s = s + "\"\n}";
        return s;
    }
}