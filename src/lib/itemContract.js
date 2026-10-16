// SQL and HTTP contracts use English fields. The presentation models used by
// existing stock, notification and master workflows are mapped at the boundary.
export const itemColumnRenames = Object.freeze({
  "items": {
    "kode": "code",
    "nama": "name",
    "kelompok_id": "item_group_id",
    "satuan_id": "unit_id",
    "rak_id": "rack_id",
    "stok": "stock",
    "stok_min": "min_stock",
    "harga": "price",
    "deskripsi": "description"
  },
  "item_groups": {
    "kode": "code",
    "nama": "name",
    "deskripsi": "description"
  }
});

function renameFields(input, mapping, reverse = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return input;
  const output = { ...input };
  for (const [legacy,canonical] of Object.entries(mapping)) {
    const [source,target] = reverse ? [canonical,legacy] : [legacy,canonical];
    if (!Object.hasOwn(output,source)) continue;
    if (Object.hasOwn(output,target) && output[target] !== output[source]) {
      throw Object.assign(new Error(`Conflicting item fields: ${source}, ${target}`),{status:422});
    }
    output[target] = output[source]; delete output[source];
  }
  return output;
}
export const toPublicGroup = row => renameFields(row,itemColumnRenames.item_groups);
export const fromPublicGroup = row => renameFields(row,itemColumnRenames.item_groups,true);
export function toPublicItem(row) {
  const output=renameFields(row,itemColumnRenames.items);
  if (output?.kelompok_detail) output.kelompok_detail=toPublicGroup(output.kelompok_detail);
  return output;
}
export function fromPublicItem(row) {
  const output=renameFields(row,itemColumnRenames.items,true);
  if (output?.kelompok_detail) output.kelompok_detail=fromPublicGroup(output.kelompok_detail);
  return output;
}
export function mapContractResponse(body, transform) {
  if (Array.isArray(body)) return body.map(transform);
  if (Array.isArray(body?.data)) return {...body,data:body.data.map(transform)};
  return transform(body);
}

export const masterColumnRenames = Object.freeze({
  "levels": {
    "kode": "code",
    "nama": "name",
    "deskripsi": "description",
    "hak_akses": "access_rights"
  },
  "locations": {
    "kode": "code",
    "nama": "name",
    "alamat": "address",
    "deskripsi": "description"
  }
});
export const menuColumnRenames = {
  "menus": {
    "nama": "name",
    "grup": "group_name",
    "urutan": "sort_order",
    "aktif": "is_active"
  },
  "menu_actions": {
    "nama": "name",
    "urutan": "sort_order",
    "aktif": "is_active"
  }
};
export const rackColumnRenames = {
  "racks": {
    "kode": "code",
    "nama": "name",
    "lokasi_id": "location_id",
    "kapasitas": "capacity",
    "terisi": "occupied"
  }
};
const apiColumnRenames = {...itemColumnRenames,...masterColumnRenames,...menuColumnRenames,...rackColumnRenames};
function mapMenu(row,reverse=false) {
 const output=renameFields(row,menuColumnRenames.menus,reverse);
 if(Array.isArray(output?.actions))output.actions=output.actions.map(action=>renameFields(action,menuColumnRenames.menu_actions,reverse));
 return output;
}
export function toPublicResource(resource,row) {
  if(resource === 'menus')return mapMenu(row);
  return resource === 'items' ? toPublicItem(row) : renameFields(row,apiColumnRenames[resource]);
}
export function fromPublicResource(resource,row) {
  if(resource === 'menus')return mapMenu(row,true);
  return resource === 'items' ? fromPublicItem(row) : renameFields(row,apiColumnRenames[resource],true);
}

export function itemResource(url = '') {
  const path = url.split('?')[0].replace(/^https?:\/\/[^/]+(?:\/api\/v1)?/, '').replace(/^\/api\/v1/, '');
  if (/^\/rak(?:\/|$)/.test(path)) return 'racks';
  if (/^\/menus(?:\/|$)/.test(path)) return 'menus';
  if (/^\/barang(?:\/|$)/.test(path)) return 'items';
  if (/^\/kelompok-barang(?:\/|$)/.test(path)) return 'item_groups';
  if (/^\/level-pengguna(?:\/|$)/.test(path)) return 'levels';
  if (/^\/lokasi(?:\/|$)/.test(path)) return 'locations';
  return null;
}
export function encodeItemRequest(url, data) {
  const resource=itemResource(url);
  if (!resource || data == null) return data;
  const mapping=apiColumnRenames[resource];
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const output=new FormData();
    for (const [key,value] of data.entries()) output.append(mapping[key] || key,value);
    return output;
  }
  return toPublicResource(resource,data);
}
export function decodeItemResponse(url, data) {
  const resource=itemResource(url);
  return resource ? mapContractResponse(data,row => fromPublicResource(resource,row)) : data;
}
