import {HandleState, SliderModel} from './model';
import{View} from './view'

class Controller {
    model: SliderModel;
    myView : View;
    constructor(model: SliderModel, myView: View) {
      this.model = model;
      this.myView = myView;
    }

    // onHandleMouseDown(mouseEvent) :void {

    //     $(document).on('mousemove', function () { this.myView.OnHandleMove(); });

    //     $(document).on('mouseup', function () {
    //         $(document).off('mousemove');
    //     })
    // }   
    // this.myView.handles.on('mousedown', Controller.onHandleMouseDown);
    // this.myView.slider.on('click', this.myView.onHandleMove);
};