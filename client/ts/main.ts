/// <reference path="./konva.d.ts" />

interface SelectToolbar {
    where: string,
    idx: number
};

interface CompPattern {
    name: string,
    short_name: string,
    internal_name: string,
    nb_pins: number,
    color: string
}

const comps : CompPattern[] = [
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

function randomStr(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

class NTS {
    private stage: Konva.Stage;
    private layer: Konva.Layer;
    private comps: Konva.Group[];
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
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    setDraggable(state: boolean) {
        this.comps.forEach((comp) => {
            comp.setAttr('draggable', state);
        });
    }

    compute() {
        let $compute = $("#compute");
        let output : string;
        output = ".components<br>";
        this.comps.forEach((elem) => {
            let pattern = elem.getAttr('pattern');
            console.log(elem.getAttr('pattern'));
            output += pattern.internal_name + " " + elem.name() + "<br>";
        });
        $compute.find(".modal-body").html(output);
        $('#compute').modal();
    }

    handleToolbar() {
        this.bar.find('.btn-tool').click((e) => {
            this.bar.find('.btn-tool').removeClass('selected');
            this.compBar.find('.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            let newState = this.getToolbarSelected();
            if (newState.where == 'bar' && newState.idx == 0) {
                this.setDraggable(true);
            } else {
                this.setDraggable(false);
            }
            if (newState.where == 'bar' && newState.idx == 2) {
                this.compute();
            }
        });
    }

    handleCompList() {
        this.compBar.find('.component div').click((e) => {
            this.bar.find('.btn-tool').removeClass('selected');
            this.compBar.find('.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
            this.setDraggable(false);
            this.getToolbarSelected();
        });
    }

    getToolbarSelected() : SelectToolbar {
        let btn = this.bar.find('.btn-tool');
        for (let i = 0; btn[i]; i++) {
            if ($(btn[i]).hasClass('selected')) {
                return ({ where: 'bar', idx: i });
            }
        }
        let comp = this.compBar.find('.component');
        for (let i = 0; comp[i]; i++) {
            if ($(comp[i]).find('div').hasClass('selected')) {
                return ({ where: 'list', idx: i });
            }
        }
        return ({ where: 'null', idx: -1 });
    }

    select(name: string) {
        this.bar.find('.btn-tool').removeClass('selected');
        this.bar.find('#' + name).addClass('selected');
    }

    createMonoComponent(color: string, x: number, y: number) : Konva.Group {
        let ret = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
            name: randomStr(6)
        });

        let pin = new Konva.Circle({
            radius: 10,
            fill: color,
            stroke: 'black'
        });
        pin.on('mouseover', () => {
            let tb = this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 1) {
                this.stage.container().style.cursor = 'pointer';
            }
        });
        pin.on('mouseout', () => {
            this.stage.container().style.cursor = '';
        });
        ret.add(pin);
        return (ret);
    }

    createXPinComp(nbPin: number, color: string, x: number, y: number) : Konva.Group {
        let ret = new Konva.Group({
            x: x,
            y: y,
            draggable: true,
            name: randomStr(6)
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
                let pin = new Konva.Circle({
                    x: (j + 1) * (len / ((nbPin / 2) + 1)),
                    y: i * 60,
                    radius: 10,
                    fill: 'white',
                    stroke: 'black'
                });
                pin.on('mouseover', () => {
                    let tb = this.getToolbarSelected();
                    if (tb.where == 'bar' && tb.idx == 1) {
                        this.stage.container().style.cursor = 'pointer';
                    }
                });
                pin.on('mouseout', () => {
                    this.stage.container().style.cursor = '';
                });
                ret.add(pin);
            }
        }
        return (ret);
    }

    handleUpdateComp(m_this: NTS) {
        return (e) => {
            let comp: Konva.Group = e.currentTarget;
            let tb = m_this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 0) {
                let pattern :CompPattern = comp.getAttr('pattern');
                console.log('two');
                $('#type').val(pattern.name);
                $('#name').val(comp.name()).removeAttr('disabled');
            }
        }
    }

    handleAddComp() {
        this.stage.on('contentClick', (evt) => {
            let toolbar = this.getToolbarSelected();
            if (toolbar.where == 'list') {
                let compPattern = comps[toolbar.idx];
                let comp: Konva.Group;
                let pos = this.stage.getPointerPosition();
                if (compPattern.nb_pins > 1) {
                    comp = this.createXPinComp(compPattern.nb_pins, compPattern.color, pos.x, pos.y);
                } else {
                    comp = this.createMonoComponent(compPattern.color, pos.x, pos.y);
                }
                comp.setAttr('draggable', false);
                comp.setAttr('pattern', compPattern);
                comp.on('mouseover', () => {
                    let tb = this.getToolbarSelected();
                    if (tb.where == 'bar' && tb.idx == 0) {
                        this.stage.container().style.cursor = 'pointer';
                    }
                });
                comp.on('mouseout', () => {
                    this.stage.container().style.cursor = '';
                });
                comp.on('click', this.handleUpdateComp(this));
                this.comps.push(comp);
                this.layer.add(comp);
                this.stage.draw();
            }
            
            console.log(evt);
            console.log(evt.target);
            // $('#name').val('').attr('disabled');
        });
    }

    initComp() {
        comps.forEach((elem) => {
            let e = $("<div>").addClass("component")
                .append($("<div>").text(elem.name).css("background", elem.color));
            $(".comp-list .list").append(e);
        });
        this.select('mouse');
        this.handleCompList();
        this.stage.draw();
    }
}

let nts = new NTS();
nts.initComp();
nts.handleAddComp();


