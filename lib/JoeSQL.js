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
    
    // TODO: Make a helper/base function around select like around WHERE, AND, OR and #conditional

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

    and = (condition, not = false) => {
        this.statement += this.#conditional(`AND`, condition, not);

        return this;
    }

    or = (condition, not = false) => {
        this.statement += this.#conditional(`OR`, condition, not);

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
}

export default JoeSQL;