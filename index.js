import JoeSQL from "./lib/JoeSQL.js";

const sql = new JoeSQL();

const test = sql.select("albums").where({
    key: "artist",
    value: null}).statement;

console.log(test);
