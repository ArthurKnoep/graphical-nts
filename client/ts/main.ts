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

interface LinkTrace {
    state: number,
    start: Konva.Circle,
    end: Konva.Circle,
    line: Konva.Line
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
    private current: Konva.Group;
    private bar: JQuery;
    private compBar: JQuery;
    private link: LinkTrace;
    private links: LinkTrace[];

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
        this.current = null;
        this.link = {
            state: 0,
            start: null,
            end: null,
            line: null
        };
        this.links = new Array();
    }

    setDraggable(state: boolean) {
        this.comps.forEach((comp) => {
            comp.setAttr('draggable', state);
        });
    }

    compute() {
        let $compute = $("#compute");
        let output : string;
        output = ".chipsets<br>";
        this.comps.forEach((elem) => {
            let pattern = elem.getAttr('pattern');
            output += pattern.internal_name + " " + elem.name() + "<br>";
        });
        output += "<br>.links:<br>";
        this.links.forEach((link) => {
            output += link.start.getParent().name()+':'+(link.start.getAttr('idx') + 1)+' '+
                link.end.getParent().name()+':'+(link.end.getAttr('idx') + 1)+'<br>';
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
            this.stage.container().style.cursor = '';
            if (newState.where == 'bar' && newState.idx == 0) {
                this.setDraggable(true);
            } else {
                this.setDraggable(false);
                this.unsetEditWin();
            }
            if (newState.where == 'bar' && newState.idx != 1) {
                this.endTraceLink();
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
            this.unsetEditWin();
            this.stage.container().style.cursor = 'crosshair';
            this.endTraceLink();
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

    unsetEditWin() {
        $('#name').val('').attr('disabled', 'true');
        $('#type').val('').attr('disabled', 'true');
        $('#delete').attr('disabled', 'true');
        if (this.current) {
            this.selectComp(this.current, false);
        }
    }

    traceLink() {
        return (evt) => {
            let tb = this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 1 && this.link.state == 0) {
                this.link.start = evt.currentTarget;
                this.link.state = 1;
            } else if (tb.where == 'bar' && tb.idx == 1 && this.link.state == 1) {
                let start = this.link.start.getAbsolutePosition();
                let end = evt.currentTarget.getAbsolutePosition();
                let toAppend: LinkTrace = { start: null, end: null, line: null, state: -1 };
                let line = new Konva.Line({
                    points: [start.x, start.y, end.x, end.y],
                    stroke: 'black',
                    strokeWidth: 2
                });
                this.layer.add(line);
                line.setZIndex(1);
                toAppend = { start: this.link.start, end: evt.currentTarget, line: line, state: 2 };
                this.links.push(toAppend);
                this.link.line.remove();
                this.link = { start: null, end: null, line: null, state: 0 };
                this.stage.draw();
            }
        }
    }

    handleMoveGroup() {
        return evt => {
            let t_comp: Konva.Group = evt.currentTarget;
            let children:Konva.Collection = t_comp.getChildren();
            for (let i = 0; children[i]; i++) {
                if (children[i].className == 'Circle') {
                    for (let j = 0; this.links[j]; j++) {
                        if (children[i] == this.links[j].start || children[i] == this.links[j].end) {
                            let posStart;
                            let posEnd;
                            this.links[j].line.remove();
                            if (children[i] == this.links[j].start) {
                                posStart = children[i].getAbsolutePosition();
                                posEnd = this.links[j].end.getAbsolutePosition();
                            }
                            if (children[i] == this.links[j].end) {
                                posStart = this.links[j].start.getAbsolutePosition();
                                posEnd = children[i].getAbsolutePosition();
                            }
                            let newLine = new Konva.Line({
                                points: [posStart.x, posStart.y, posEnd.x, posEnd.y],
                                stroke: 'black',
                                strokeWidth: 2
                            });
                            this.layer.add(newLine);
                            newLine.moveToBottom();
                            this.links[j].line = newLine;
                            this.stage.draw();
                        }
                    }
                }
            }
        }
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
        pin.setAttr('hasComp', 0);
        pin.setAttr('idx', 0);
        pin.on('click', this.traceLink());
        ret.on('dragmove', this.handleMoveGroup());
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

        let rect = new Konva.Rect({
            width: len,
            height: 60,
            fill: color,
            stroke: 'black'
        });
        ret.add(rect);
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
                pin.setAttr('hasComp', 1);
                pin.setAttr('idx', i * (nbPin / 2) + j);
                pin.on('click', this.traceLink());
                ret.add(pin);
            }
        }
        ret.on('dragmove', this.handleMoveGroup());
        return (ret);
    }

    updateComp() {
        let tb = this.getToolbarSelected();
        if (tb.where == 'bar' && tb.idx == 0) {
            $('#name').change(() => {
                let comps = this.comps;
                for (let i = 0; comps[i]; i++) {
                    if (comps[i].name() == $('#name').val().toString()) {
                        return;
                    }
                }
                this.current.name($('#name').val().toString());
            });
        }
    }

    selectComp(comp: Konva.Group, state: boolean) {
        let child = comp.getChildren();
        for (let i = 0; child[i]; i++) {
            child[i].setAttr('stroke', (state) ? 'gray' : 'black');
        }
        this.stage.draw();
    }

    handleUpdateComp(m_this: NTS) {
        return (e) => {
            let comp: Konva.Group = e.currentTarget;
            let tb = m_this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 0) {
                let pattern :CompPattern = comp.getAttr('pattern');
                this.comps.forEach((comp) => { this.selectComp(comp, false); });
                this.selectComp(comp, true);
                this.current = comp;
                $('#type').val(pattern.name);
                $('#name').val(comp.name()).removeAttr('disabled');
                $('#delete').removeAttr('disabled');
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
        });
    }

    handleDelComp() {
        $('#delete').click(() => {
            let tb = this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 0) {
                for (let i = 0; this.comps[i]; i++) {
                    if (this.current.name() == this.comps[i].name()) {
                        let children = this.current.getChildren();
                        for (let i = 0; children[i]; i++) {
                            if (children[i].className == 'Circle') {
                                let links = this.links;
                                for (let j = 0; links[j]; j++) {
                                    if (links[j].start == children[i] || links[j].end == children[i]) {
                                        links[j].line.remove();
                                        this.links.splice(j, 1);
                                        j -= 1;
                                    }
                                }
                            }
                        }
                        this.comps[i].remove();
                        this.stage.draw();
                        this.comps.splice(i, 1);
                        this.unsetEditWin();
                        break;
                    }
                }
            }
        });
    }

    handleTraceLink() {
        this.stage.on('contentMousemove', () => {
            let tb = this.getToolbarSelected();
            if (tb.where == 'bar' && tb.idx == 1 && this.link.state == 1) {
                let start = this.link.start.getAbsolutePosition();
                let end = this.stage.getPointerPosition();
                if (this.link.line) {
                    this.link.line.remove();
                }
                this.link.line = new Konva.Line({
                    points: [start.x, start.y, end.x, end.y],
                    stroke: 'black',
                    strokeWidth: 2
                });
                this.layer.add(this.link.line);
                this.link.line.moveToBottom();
                this.stage.draw();
            }

            //Handle cursor change
            if (tb.where == 'list') {
                this.stage.container().style.cursor = 'crosshair';
            }
        });
    }

    handleCloseModal() {
        $('.modal-footer button[data-dismiss="modal"]').click(() => {
            this.select('mouse');
            this.setDraggable(true);
        });
    }

    endTraceLink() {
        if (this.link.state != 0) {
            this.link.line.remove();
            this.stage.draw();
        }
        this.link = { start: null, end: null, line: null, state: 0 };
    }

    handleEndTraceLink() {
        document.addEventListener('keydown', (evt) => {
            if (evt.code == 'Escape') {
                this.endTraceLink();
            }
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
nts.handleDelComp();
nts.updateComp();
nts.handleTraceLink();
nts.handleCloseModal();
nts.handleEndTraceLink();
