let Variables = {
    Color: {
        Blue: "#2b2d42",
        DarkWhite: "rgb(237,241,245)",
        White: "rgb(255,255,255)",
        Peach: "rgb(250,122,122)",
        Red: "rgb(232,93,117)"
    }
}
let PreviousVariables = {}

/**
 * @param {string} string
*/
export const Compile = async function (string) {
    const LINES = string
        .split("\n")
        .map(line => line.split(";").flat())
        .flat()
        .filter(line => !line.trim().startsWith("//") && line.length > 5);

    for (
        const LINE 
            of 
        LINES
    ) {
        const inputs = LINE.trim().split("\"").map(str => str.trim());
        // SELECT "header" AND CHANGE "background-color" TO "none";
        // SELECT
        // header
        // AND CHANGE 
        // background-color
        // TO 
        // none

        // REMOVE BACKGROUND "header";
        // REMOVE BACKGROUND
        // header

        // VARIABLE "x" = "1";
        // VARIABLE
        // X
        // =
        // 1

        // CHANGE VARIABLE "$var.Color.Blue" TO "1";
        // CHANGE VARIABLE
        // $var.Color.Blue
        // TO
        // 1

        // CHANGE VARIABLE "$var.Color.Blue" TO "1" FOR "1" LINE;
        // CHANGE VARIABLE
        // $var.Color.Blue
        // TO
        // 1
        // FOR
        // 1
        // LINE

        const action    = inputs[0];

        switch (action) {
            case "SELECT": {
                const element   = document.querySelector(inputs[1]);
                const styleprop = inputs[3];
                const value     = $(inputs[5]);

                if (value.includes("!important")) {
                    element.setAttribute("style", `${styleprop}:${value}`);
                } else {
                    element.style.setProperty(styleprop, value)
                }
            } break;

            case "SELECT ALL": {
                const element   = inputs[1];
                const styleprop = inputs[3];
                const value     = $(inputs[5]);

                console.log(element, styleprop, $(value))
        
                document.querySelectorAll(element).forEach(element => {
                    if (value.includes("!important")) {
                        element.setAttribute("style", `${styleprop}:${value}`);
                    } else {
                        element.style.setProperty(styleprop, value)
                    }
                })
            } break;

            case "REMOVE BACKGROUND": {
                document.querySelector(inputs[1]).style.backgroundColor = "transparent"
            } break;

            case "VARIABLE": {
                $(inputs[1], "SET", Variables, inputs[3])
            } break;

            case "CHANGE VARIABLE": {
                const Variable = inputs[1];
                const NewValue = inputs[3];

                $(Variable, "SET", Variables, NewValue)
            } break;
        }

        /**
         * @param {string} value 
         * @param {"ACCESS"|"UPDATE"|"SET"} type 
         * @param {object} parent
         * @param {string} updateValue
         * @returns 
         */
        function $ (value, type, parent, updateValue, doesNotRequiresSystemChecking) {
            if (!type) type = "ACCESS"
            if (!parent) parent = Variables

            if (type !== "ACCESS") {
                updateValue = $(updateValue, "ACCESS", parent)
            }

            if (type === "SET" && $(value, "ACCESS", parent) !== undefined && !doesNotRequiresSystemChecking) {
                return $(value, "UPDATE", parent, updateValue, true)
            }

            if (type === "UPDATE" && $(value, "ACCESS", parent) !== undefined && !doesNotRequiresSystemChecking) {
                return $(value, "SET", parent, updateValue, true)
            }

            switch (type) {
                case "ACCESS": {
                    if (value.startsWith("$var.")) {
                        // $var.Color.Blue
                        const properties = value.slice("$var.".length).split(".") 
                        const TrueValue = (() => {
                            let cache
                            let prevprop
        
                            for (const property of properties) {
                                if (prevprop) {
                                    cache = parent[prevprop][property]
                                } else {
                                    cache = parent[property]
                                }
        
                                prevprop = property
                            }
        
                            return cache
                        })();
        
                        return TrueValue
                    } else return value
                }

                case "UPDATE": {
                    if (value.startsWith("$var.")) {
                        // $var.Color.Blue
                        const properties = value.slice("$var.".length).split(".") 
                        const TrueValue = (() => {
                            let cache
                            let prevprop
        
                            for (let i = 0 ; i < properties.length ; i++) {
                                const property = properties[i]

                                if (prevprop) {
                                    cache = parent[prevprop][property]
                                } else {
                                    cache = parent[property]
                                }
        

                                if (i === properties.length - 1) {
                                    if (prevprop) {
                                        parent[prevprop][property] = updateValue
                                    } else {
                                        parent[property] = updateValue
                                    }
                                }

                                prevprop = property
                            }        
                        })();
        
                        return TrueValue
                    } else return value
                }

                case "SET": {
                    if (value.startsWith("$var.")) {
                        const properties = value.slice("$var.".length).split(".")

                        let data = {}
                        let prevprop

                        for (let i = 0 ; i < properties.length ; i++) {
                            const p = properties[i]

                            if (prevprop) {
                                data[prevprop][p] = properties[i + 1] ? {
                                    [properties[i + 1]]: {}
                                } : updateValue
                                if (properties[i + 1] === undefined) break
                            } else {
                                data[p] = properties[i + 1] ? {
                                    [properties[i + 1]]: {}
                                } : updateValue
                                if (properties[i + 1] === undefined) break
                            }

                            prevprop = p
                        }

                        parent = { ...parent, ...data }
                    } else return value
                }
            }
        }
    }
}