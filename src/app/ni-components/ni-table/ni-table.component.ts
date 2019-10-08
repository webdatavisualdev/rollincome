import { Component, OnInit, Input, EventEmitter, Output, Inject, Optional } from '@angular/core';
import { ApiService } from '../../services/api.service'
import { MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA } from '@angular/material';
import { NiDialogComponent } from '../ni-dialog/ni-dialog.component';

@Component({
  selector: 'ni-table',
  templateUrl: './ni-table.component.html',
  styleUrls: ['./ni-table.component.scss'],
  host: {
    '[class.ni-table]': 'true'
  }
})
export class NiTableComponent implements OnInit {
  @Input() headers: any = [];
  @Input() data: any = [] ;
  @Output() showRequestDialog = new EventEmitter();
  @Output() showAlert = new EventEmitter();

  constructor(private apiService: ApiService, private dialog: MdDialog) {
  }

  ngOnInit() {
    console.log(this.data);
  }

  changePage(id) {
    this.apiService.showSpinner.next(true);
    this.apiService.isClickedDetails.next(true);
    this.apiService.groupId.next(id);
  }

  showDialog(groupId) {
    this.showRequestDialog.emit(groupId);
  }

  removeUser(memberId) {
    let dialogRef = this.dialog.open(NiDialogComponent, {
      data: {
        content: 'Do you really want to remove this member?',
        okText: 'Yes',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        this.apiService.removeUser(memberId).then((res: any) => {
          if (res.status === 'yes') {
            this.showAlert.emit({status: 'ok', text: 'Removing member'});
          } else {
            // this.showAlert.emit({status: 'cancel', text: 'Removing member'});
          }
        });
      } else {
      }
    });
  }

  removeAddress(address) {
    let dialogRef = this.dialog.open(NiDialogComponent, {
      data: {
        content: 'Do you really want to remove?',
        okText: 'Yes',
        cancelText: 'Cancel'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        this.apiService.removeAddress(address.id).then((res: any) => {
          if (res.status === 'yes') {
            this.showAlert.emit({status: 'ok', text: 'Removing member'});
          } else {
            // this.showAlert.emit({status: 'cancel', text: 'Removing member'});
          }
        });
      } else {
      }
    });
  }

  showPayDialog(data) {
    let dialogRef = this.dialog.open(DialogPaymentComponent, {
      data: data.data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        this.showAlert.emit({status: result, text: 'Paying obligation'});
      }
    });
  }

  updateAddress(address) {
    let dialogRef = this.dialog.open(DialogAddressComponent, {
      data: address
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'ok') {
        this.showAlert.emit({status: result, text: 'Updating Address'});
      }
    });
  }

  updatePermission(id) {

  }

  removePermission(id) {

  }
}

@Component({
  selector: 'dialog-payment',
  templateUrl: './dialog-payment/dialog-payment.html',
  styleUrls: ['./dialog-payment/dialog-payment.scss']
})
export class DialogPaymentComponent {

  pageNum = 1;
  selectedType = 1;
  payments = [];

  constructor(
    public dialogRef: MdDialogRef<DialogPaymentComponent>,
    @Optional() @Inject(MD_DIALOG_DATA) public data: any,
    public apiService: ApiService
  ) {
    console.log(data);
    this.apiService.getListData('PaymentMethod').then((res: any) => {
      console.log(res);
      this.payments = res.data;
    });
  }

  sendApproval() {
    this.apiService.sendApproval(this.data.id).then((res: any) => {
      if (res.request_added === 'yes') {
        this.dialogRef.close('ok');
      } else {
        this.dialogRef.close('cancel');
      }
    });
  }

  goNext() {
    this.pageNum = 2;
  }

  sendConfirmationRequest() {
    this.apiService.sendPaymentRequest(this.data.id, this.payments[this.selectedType].id).then(res => {
      this.dialogRef.close('ok');
    });
  }
}

@Component({
  selector: 'dialog-address',
  templateUrl: './dialog-address/dialog-address.html',
  styleUrls: ['./dialog-address/dialog-address.scss']
})
export class DialogAddressComponent {
  address:any = {};
  permissions = [];
  countries = [];
  states = [];
  dialogType = 'update';

  constructor(
    public dialogRef: MdDialogRef<DialogAddressComponent>,
    @Optional() @Inject(MD_DIALOG_DATA) public data: any,
    public apiService: ApiService
  ) {
    this.address = {
      address_number: data.address_number,
      address_street_name: data.address_street_name,
      address_post_code: data.address_post_code,
      address_state: data.address_state,
      address_town: data.address_town,
      address_country: data.address_country,
      address_extra_info: data.address_extra_info,
      address_id: data.address_id,
      perm_code: ''
    };

    apiService.getListData('AccountPermission').then((res: any) => {
      this.permissions = res.data;
    });

    apiService.getListData('Country').then((res: any) => {
      this.countries = res.data;
    });

    this.apiService.getListData('State', this.address.address_country).then((res: any) => {
      this.states = res.data;
    });
  }

  updateAddress() {
    this.apiService.updateAddress(this.address).then((res: any) => {
      console.log(res);
      if (res) {
        this.dialogRef.close('ok');
      }
    })
  }

  selectCountry() {
    this.apiService.getListData('State', this.address.address_country).then((res: any) => {
      this.states = res.data;
    });
  }
}