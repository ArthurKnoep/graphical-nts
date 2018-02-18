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
    private comps : Konva.Group[];
    private bar: JQuery;
    private compBar: JQuery;
    
    constructor() {
        this.stage = new Konva.Stage({
            container: 'konva',
            width: $(".edit-win").width(),
            height: $(".edit-win").height() - 50
        });
        this.bar = $('.toolbar');
        this.compBar = $('.comp-list .list');
        this.handleToolbar();
        this.comps = new Array();
    }

    setDraggable(state: boolean) {
        this.comps.forEach((comp) => {
            comp.setAttr('draggable', state);
        });
    }

    handleToolbar() {
        this.bar.find('.btn-tool').click((e) => {
            this.bar.find('.btn-tool').removeClass('selected');
            this.compBar.find('.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            let newState = this.getToolbarSelected();
            if (newState == 0) {
                this.setDraggable(true);
            } else {
                this.setDraggable(false);
            }
        });
    }

    handleCompList() {
        this.compBar.find('.component div').click((e) => {
            this.bar.find('.btn-tool').removeClass('selected');
            this.compBar.find('.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            this.setDraggable(false);
        });
    }

    getToolbarSelected() {
        let btn = this.bar.find('.btn-tool');
        for (let i = 0; btn[i]; i++) {
            if ($(btn[i]).hasClass('selected')) {
                return (i);
            }
        }
        return (-1);
    }

    select(name: string) {
        this.bar.find('.btn-tool').removeClass('selected');
        this.bar.find('#' + name).addClass('selected');
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

    createXPinComp(nbPin: number, color: string, x: number, y: number) : Konva.Group {
        let ret = new Konva.Group({
            x: x,
            y: y,
            draggable: true
        });

        if (nbPin % 2 != 0) {
            throw "A component must have a pair number of pin";
        }
        let len = 50 * (nbPin / 2);
        
        ret.add(
            new Konva.Rect({
                width: len,
                height: 60,
                fill: color,
                stroke: 'black'
            })
        );
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < (nbPin / 2); j++) {
                ret.add(
                    new Konva.Circle({
                        x: (j + 1) * (len / ((nbPin / 2) + 1)),
                        y: i * 60,
                        radius: 10,
                        fill: 'white',
                        stroke: 'black'
                    })
                )
            }
        }
        return (ret);
    }

    initComp() {
        comps.forEach((elem) => {
            let e = $("<div>").addClass("component")
                .append($("<div>").text(elem.name).css("background", elem.color));
            $(".comp-list .list").append(e);
        });
        this.select('mouse');
        this.handleCompList();

        var layer = new Konva.Layer();
        // layer.add(this.createXPinComp(4, 'red', 200, 200));
        this.comps.push(this.createXPinComp(4, 'red', 200, 200));
        this.comps.push(this.createXPinComp(8, 'red', 200, 400));
        // comp8.on('dragstart', (e) => {
        //     let toolbar = this.toolbar.getCurrent();
        //     let group: Konva.Group = e.currentTarget;
        //     if (toolbar != 0) {
        //         group.setAttr('draggable', false);
        //     } else {
        //         group.setAttr('draggable', true);
        //     }
        // });
        // layer.add(comp8);
        // layer.add(this.createMonoComponent('red', 200, 200));
        // layer.add(this.create4PinComp('red', 400, 200));
        layer.add(this.comps[0]);
        layer.add(this.comps[1]);
        this.stage.add(layer);
        this.stage.draw();
    }
}

let nts = new NTS();
nts.initComp();


