/// <reference path="./konva.d.ts" />

const comps = [
    {
        name: "Input",
        short_name: "I",
        internal_name: "input",
        nb_pins: 1,
        color: '#0000FF'
    },
    {
        name: "Output",
        short_name: "O",
        internal_name: "output",
        nb_pins: 1,
        color: '#00FF00'
    },
    {
        name: "4008",
        short_name: "4008",
        internal_name: "4008",
        nb_pins: 16,
        color: '#FF0000'
    }
];

class NTS {
    private stage: Konva.Stage;

    constructor() {
        this.stage = new Konva.Stage({
            container: 'konva',
            width: $(".edit-win").width(),
            height: $(".edit-win").height() - 50
        });
        $("canvas").click(() => {
            console.log("ok");
        })
    }


    createMonoComponent(color) : Konva.Group {
        let ret = new Konva.Group();

        ret.add(
            new Konva.Circle({
                radius: 10,
                fill: color,
                stroke: 'black',
                draggable: true
            })
        );
        return (ret);
    }

    create4PinComp(color) : Konva.Group {
        let ret = new Konva.Group();

        return (ret);
    }


    initComp() {
        comps.forEach((elem) => {
            let e = $("<div>").addClass("component")
                .append($("<div>").text(elem.name).css("background", elem.color));
            $(".comp-list .list").append(e);
        });

        var layer = new Konva.Layer();
        layer.add(this.createMonoComponent('red'));
        this.stage.add(layer);
    }
    initClick() {

    }
}

let nts = new NTS();
nts.initComp();

