
const isString = (object) => {
    return (typeof object === 'string' || object instanceof String);
}

class JoeSQL {
    constructor() {
        this.statement = "";
    }

    select = (table, ...columns) => {
        columns = (columns.length == 0) ? "*" : columns.join(", ");

        this.statement = `SELECT ${columns} FROM ${table} `;

        return this;
    }

    selectDistinct = (table, ...columns) => {
        columns = (columns.length == 0) ? "*" : columns.join(", ");

        this.statement = `SELECT DISTINCT ${columns} FROM ${table} `;

        return this;
    }

    #conditional = (connector, condition, not) => {
        if (isString(condition.value)) condition.value = `"${condition.value}"`;

        if (condition.key.includes("NULL")) {
            return `${connector}`
        }

        return `${connector} ${not ? "NOT " : ""}${condition.key}=${condition.value} `;
    }

    where = (condition, not=false) => {
        this.statement += this.#conditional(`WHERE`, condition, not);

        return this;
    }

    and = (condition, not=false) => {
        this.statement += this.#conditional(`AND`, condition, not);

        return this;
    }

    or = (condition, not=false) => {
        this.statement += this.#conditional(`OR`, condition, not);

        return this;
    }

    orderBy = (...columns) => {
        this.statement += `ORDER BY `;
        this.statement += columns.map(col => `${col.name} ${col.order ?? ""}`.trim()).join(", ").trim() + " ";

        return this;
    }

    insert = (table, columns=null, ...values) => {
        this.statement += `INSERT INTO ${table} `;
        this.statement += (columns === null) ? "" : `(${columns.join(", ")}) `;
        this.statement += `VALUES `;
        this.statement += values.map(v => `(${v.join(", ")})`),join(", ").trim() + " ";
    }
}

export default JoeSQL;