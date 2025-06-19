export default class Tile {
    #tileElement
    #x
    #y
    #value

    // give the value to tile as 2 or 4, at a 50:50 chance
    constructor(tileContainer, value = Math.random() > 0.5 ? 2 : 4) {
        this.#tileElement = document.createElement("div");
        this.#tileElement.classList.add("tile");
        tileContainer.append(this.#tileElement)
        this.value = value;
    }

    get value(){
        return this.#value
    }

    // v denotes the values 2 or 4
    set value(v){
        this.#value = v;
        this.#tileElement.textContent = v;
        const power = Math.log2(v)                                                                         // to determine no.of times the power of that number raised by 2
        const backgroundLightness = 100 - power * 9                                                        // if power increases by 1, then decrease my lightness by 9%.
        this.#tileElement.style.setProperty("--background-lightness", `${backgroundLightness}%`)
        this.#tileElement.style.setProperty("--text-lightness", `${backgroundLightness <= 50 ? 90 : 10}%`) // if less than 50, use bright color otherwise use dark color.
    }

    // use the x & y values and set the css variable values to the new x & y values, thus positioning the tile
    set x(value){
        this.#x = value
        this.#tileElement.style.setProperty("--x", value)
    }

    set y(value){
        this.#y = value
        this.#tileElement.style.setProperty("--y", value)
    }

    remove(){
        this.#tileElement.remove()
    }

    waitForTransition(animation = false){
        // by default it is not animation
        return new Promise(resolve => {
            // if it is a animation, end it.
            // else, adding listener at transition end, thus calling resolve function
            // done only once
            this.#tileElement.addEventListener(animation ? "animationend" :"transitionend", resolve, {once : true,})
        })
    }
}