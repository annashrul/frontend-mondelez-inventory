import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeItemRequest,decodeItemResponse,itemResource} from '../src/lib/itemContract.js';

test('item transport writes English JSON fields and restores the form model from paginated responses',()=>{
 const form={id:1,kode:'BRG-1',nama:'Modular Chain',kelompok_id:2,satuan_id:3,rak_id:4,stok:0,stok_min:1,harga:25.5,deskripsi:'Description',kelompok_detail:{kode:'G-1',nama:'Chain',deskripsi:'Group'}};
 const request=encodeItemRequest('/barang/1',form);
 assert.equal(request.code,'BRG-1');assert.equal(request.name,'Modular Chain');assert.equal(request.stock,0);
 assert.equal(request.item_group_id,2);assert.equal(request.unit_id,3);assert.equal(request.rack_id,4);assert.equal(request.description,'Description');
 assert.ok(!Object.hasOwn(request,'kode'));assert.ok(!Object.hasOwn(request,'stok'));
 const response=decodeItemResponse('/barang',{data:[request],pagination:{total:1},search_audit_id:'audit-1'});
 assert.deepEqual(response.data[0],form);assert.equal(response.search_audit_id,'audit-1');assert.equal(response.pagination.total,1);
});

test('group writes, code generation and unrelated master endpoints use the correct contract',()=>{
 assert.deepEqual(encodeItemRequest('/kelompok-barang',{kode:'G-1',nama:'Group',deskripsi:'Detail'}),{code:'G-1',name:'Group',description:'Detail'});
 assert.deepEqual(decodeItemResponse('/kelompok-barang/kode-otomatis',{code:'G-1'}),{kode:'G-1'});
 assert.deepEqual(decodeItemResponse('/barang/kode-otomatis',{code:'BRG-1'}),{kode:'BRG-1'});
 const unit={kode:'UNIT-1',nama:'pcs'};assert.equal(encodeItemRequest('/satuan',unit),unit);assert.equal(decodeItemResponse('/satuan',unit),unit);
 assert.equal(itemResource('https://inventory.example/api/v1/barang?search=chain'),'items');
 assert.equal(itemResource('/search-audit'),null);
});

test('multipart requests rename fields while preserving numeric zero and uploaded image bytes',async()=>{
 const form=new FormData();form.append('kode','BRG-1');form.append('nama','Chain');form.append('stok',0);form.append('kelompok_id','2');form.append('image',new Blob(['original-image'],{type:'image/png'}),'item.png');
 const encoded=encodeItemRequest('/barang',form);
 assert.equal(encoded.get('code'),'BRG-1');assert.equal(encoded.get('name'),'Chain');assert.equal(encoded.get('stock'),'0');assert.equal(encoded.get('item_group_id'),'2');assert.equal(encoded.has('kode'),false);
 assert.equal(encoded.get('image').name,'item.png');assert.equal(await encoded.get('image').text(),'original-image');
 assert.equal(form.get('kode'),'BRG-1','original form is not mutated');
});

test('level and location transport preserves permissions, address and existing form models',()=>{
 for(const [path,form,canonical] of [
 ['/level-pengguna',{kode:'LVL-1',nama:'Admin',deskripsi:'Full',hak_akses:'1 permission',action_ids:[42],permissions:['dashboard.read']},{code:'LVL-1',name:'Admin',description:'Full',access_rights:'1 permission',action_ids:[42],permissions:['dashboard.read']}],
 ['/lokasi',{kode:'LOC-1',nama:'Warehouse',alamat:'Address',deskripsi:'Detail',jumlah_rak:2},{code:'LOC-1',name:'Warehouse',address:'Address',description:'Detail',jumlah_rak:2}]
 ]) {
  assert.deepEqual(encodeItemRequest(path,form),canonical);
  assert.deepEqual(decodeItemResponse(path,{data:[canonical],pagination:{total:1}}),{data:[form],pagination:{total:1}});
  assert.deepEqual(decodeItemResponse(path+'/kode-otomatis',{code:canonical.code}),{kode:form.kode});
 }
});

test('menu transport maps nested action labels while preserving IDs, order and permissions',()=>{
 const wire=[{id:2,key:'barang',name:'Master Barang',group_name:'Master Data',sort_order:2,is_active:true,actions:[{id:201,key:'read',name:'Lihat',sort_order:1,is_active:true,permission:'barang.read'}]}];
 const ui=decodeItemResponse('/menus',wire);
 assert.equal(ui[0].nama,'Master Barang');assert.equal(ui[0].grup,'Master Data');assert.equal(ui[0].urutan,2);assert.equal(ui[0].aktif,true);
 assert.deepEqual(ui[0].actions[0],{id:201,key:'read',nama:'Lihat',urutan:1,aktif:true,permission:'barang.read'});
 assert.deepEqual(encodeItemRequest('/menus',ui[0]),wire[0]);
 assert.equal(itemResource('/api/v1/menus'),'menus');
});

test('rack transport uses English columns and preserves QR, zero occupancy and location form values',()=>{
 const form={id:1,kode:'RAK-1',nama:'Rack One',lokasi_id:2,kapasitas:100,terisi:0,qr_code:'RAK:RAK-1',lokasi_detail:{id:2,nama:'Warehouse'},jumlah_barang:3};
 const wire=encodeItemRequest('/rak',form);
 assert.deepEqual(wire,{id:1,code:'RAK-1',name:'Rack One',location_id:2,capacity:100,occupied:0,qr_code:'RAK:RAK-1',lokasi_detail:{id:2,nama:'Warehouse'},jumlah_barang:3});
 assert.deepEqual(decodeItemResponse('/rak/1',wire),form);
 assert.deepEqual(decodeItemResponse('/rak',{data:[wire],pagination:{total:1}}),{data:[form],pagination:{total:1}});
 assert.deepEqual(decodeItemResponse('/rak/kode-otomatis',{code:'RAK-2'}),{kode:'RAK-2'});
 assert.equal(itemResource('/api/v1/rak?search=Rack'),'racks');
 assert.equal(itemResource('/pengambilan/rak'),null);
});
