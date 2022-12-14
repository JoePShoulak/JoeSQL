/* == HELPER FUNCTION == */
const isString = (object) => {
    return (typeof object === 'string' || object instanceof String);
}

/* == CLASS == */
// Basing off of https://www.w3schools.com/sql/default.asp
class JoeSQL {
    constructor() {
        this.statement = "";
    }
    
    #selectional = (table, type, columns) => {
        columns = (columns.length == 0) ? "*" : columns.join(", ");

        return `${type} ${columns} FROM ${table} `;
      }

    select = (table, ...columns) => {
        this.statement += this.#selectional(table, "SELECT", columns);

        return this;
    }

    selectDistinct = (table, ...columns) => {
        this.statement += this.#selectional(table, "SELECT DISTINCT", columns);

        return this;
    }

    #selectDo = (fn, table, column) => {
        return `SELECT ${fn}(${column}) FROM ${table} `;
    }

    selectMax = (table, column) => {
        this.statement += this.#selectDo("MAX", table, column);

        return this;
    }

    selectMin = (table, column) => {
        this.statement += this.#selectDo("MIN", table, column);

        return this;
    }

    selectCount = (table, column) => {
        this.statement += this.#selectDo("COUNT", table, column);

        return this;
    }

    selectAvg = (table, column) => {
        this.statement += this.#selectDo("AVG", table, column);

        return this;
    }

    selectSum = (table, column) => {
        this.statement += this.#selectDo("SUM", table, column);

        return this;
    }

    // Private helper function for similar conditional queries (WHERE, AND, OR)
    #conditional = (connector, condition, not) => {
        /* expects condition: key: foo, value: bar
            - Typically, we would see "WHERE foo=bar"
            - If bar is a string, mysql wants to see it in quotes (i.e. "bar")
            - If condition.key is "IS NULL" or "IS NOT NULL"
                - That will override everything and does not need quotes
        */

        if (condition.value == null) {
            return `${connector} ${condition.key} IS ${not ? "NOT " : ""}`.trim() + ` NULL `;
        }

        if (isString(condition.value)) condition.value = `"${condition.value}"`;

        return `${connector} ${not ? "NOT " : ""}${condition.key}=${condition.value} `;
    }

    where = (condition, not = false) => {
        this.statement += this.#conditional(`WHERE`, condition, not);

        return this;
    }

    and = (condition, not=false) => {
        this.statement += this.#conditional(`AND`, condition, not);

        return this;
    }

    or = (condition, not = false) => {
        this.statement += this.#conditional(`OR`, condition, not);

        return this;
    }

    whereIn = (column, not, ...values) => {
        values = values.map(value => (isString(value) && !value.includes("SELECT")) ? `"${value}"` : value);

        this.statement += `WHERE ${column} ${not ? "NOT" : ""} `.trim() + ` IN (${values.join(", ")}) `;

        return this
    }

    whereBetween = (column, value1, value2) => {
        this.statement += `WHERE ${column} BETWEEN ${value1} AND ${value2} `;

        return this;
    }

    orderBy = (...columns) => {
        /* expects column: name: foo, (nullable) order: "ASC" | "DESC" */

        this.statement += `ORDER BY `;
        this.statement += columns.map(col => `${col.name} ${col.order ?? ""}`.trim()).join(", ").trim() + " ";

        return this;
    }

    insert = (table, columns, ...values) => {
        this.statement += `INSERT INTO ${table} `;
        this.statement += (columns === null) ? "" : `(${columns.join(", ")}) `;
        this.statement += `VALUES `;
        this.statement += values.map(v => `(${v.join(", ")})`).join(", ").trim() + " ";

        return this;
    }

    update = (table, changes) => {
        if (!Array.isArray(changes)) changes = [changes];

        this.statement += `UPDATE ${table} SET `;
        this.statement += changes.map(change => {
            if (isString(change.value)) change.value = `"${change.value}"`;
            return `${change.key}=${change.value}`
        }).join(", ").trim() + " ";
        
        return this;
    }

    delete = (table) => {
        this.statement += `DELETE FROM ${table} `;

        return this;
    }

    limit = (number) => {
        this.statement += `LIMIT ${number} `;

        return this;
    }

    like = (pattern) => {
        this.statement += `LIKE ${pattern} `;

        return this;
    }

    // TODO: Continue from here: https://www.w3schools.com/sql/sql_alias.asp
}

export default JoeSQL;
