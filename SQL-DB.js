module.exports = function (RED) {
    /*
    Configuration node functions
    */
    function ConfigurationNode(n) {
        RED.nodes.createNode(this, n);
        this.path = n.path;
        this.trend_table = n.trend_table;
        this.data_table = n.data_table;
    }

    RED.nodes.registerType("SQL-DB", ConfigurationNode);
}