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

class Toolbar {
    private dom: JQuery;

    constructor() {
        this.dom = $(".toolbar");
    }

    handleToolbar() {
        this.dom.find('.btn-tool').click((e) => {
            this.dom.find('.btn-tool').removeClass('selected');
            $(e.currentTarget).addClass('selected');
        });
    }

    getCurrent() {
        let btn = this.dom.find('.btn-tool');
        for (let i = 0; btn[i]; i++) {
            if ($(btn[i]).hasClass('selected')) {
                return (i);
            }
        }
        return (-1);
    }

    select(name: string) {
        this.dom.find('.btn-tool').removeClass('selected');
        this.dom.find('#' + name).addClass('selected');
    }
}

class NTS {
    private stage: Konva.Stage;
    private toolbar: Toolbar;

    constructor() {
        this.stage = new Konva.Stage({
            container: 'konva',
            width: $(".edit-win").width(),
            height: $(".edit-win").height() - 50
        });
        this.toolbar = new Toolbar();
        this.toolbar.handleToolbar();
    }


    createMonoComponent(color: string, x: number, y: number) : Konva.Group {
        let ret = new Konva.Group({
            x: x,
            y: y
        });

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

    create4PinComp(color: string, x: number, y: number) : Konva.Group {
        let ret = new Konva.Group({
            x: x,
            y: y,
            draggable: true
        });

        ret.add(
            new Konva.Rect({
                width: 130,
                height: 60,
                fill: color,
                stroke: 'black'
            })
        );
        for (let j = 0; j < 2; j++)
            for (let i = 0; i < 2; i++)
                ret.add(
                    new Konva.Circle({
                        x: (i + 1) * 43,
                        y: j * 60,
                        radius: 10,
                        fill: 'white',
                        stroke: 'black',
                    })
                );
        return (ret);
    }


    initComp() {
        comps.forEach((elem) => {
            let e = $("<div>").addClass("component")
                .append($("<div>").text(elem.name).css("background", elem.color));
            $(".comp-list .list").append(e);
        });
        this.toolbar.select('mouse');

        // var layer = new Konva.Layer();
        // layer.add(this.createMonoComponent('red', 200, 200));
        // layer.add(this.create4PinComp('red', 400, 200));
        // this.stage.add(layer);
        // this.stage.draw();
    }
}

let nts = new NTS();
nts.initComp();

