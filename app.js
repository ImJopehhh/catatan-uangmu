const auth = firebase.auth();
const db = firebase.firestore();
let docsCache = [];
let editId = null;
let deleteId = null;

const tabelBody = document.getElementById('tabel-body');
const form = document.getElementById('form');

function entriesRef(uid){
  return db.collection('users').doc(uid).collection('entries');
}

// start listener ketika auth siap
auth.onAuthStateChanged(user => {
  if (!user) return; // kalau belum login, index.html sudah redirect sebelumnya
  const uid = user.uid;
  entriesRef(uid).orderBy('createdAt','asc')
    .onSnapshot(snap => {
      docsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      render();
    }, console.error);
});

form.addEventListener('submit', async e => {
  e.preventDefault();
  const tipe = document.getElementById('tipe').value;
  const nominal = parseInt(document.getElementById('nominal').value,10);
  if (!nominal || nominal <= 0) return;
  const user = auth.currentUser;
  if (!user) return alert('Belum login');
  const now = new Date();
  await entriesRef(user.uid).add({
    tipe, nominal, tanggal: now.toLocaleString(), createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  form.reset();
});

function render(){
  tabelBody.innerHTML='';
  let total = 0;
  const runningTotals = [];
  docsCache.forEach(item=>{ total += item.tipe==='pemasukan'?Number(item.nominal):-Number(item.nominal); runningTotals.push(total); });
  for(let i=docsCache.length-1;i>=0;i--){
    const item = docsCache[i];
    const rowTotal = runningTotals[i];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.tanggal||'-'}</td>
      <td class="${item.tipe==='pemasukan'?'green':'red'}">${item.tipe==='pengeluaran'?'-':''}Rp${Number(item.nominal||0).toLocaleString()}</td>
      <td>Rp${Number(rowTotal||0).toLocaleString()}</td>
      <td>
        <button class="btn-edit" onclick="openEditById('${item.id}')">Edit</button>
        <button class="btn-hapus" onclick="openDeleteById('${item.id}')">Hapus</button>
      </td>
    `;
    tabelBody.appendChild(tr);
  }
  const pemasukan = docsCache.filter(d=>d.tipe==='pemasukan').reduce((a,b)=>a+Number(b.nominal||0),0);
  const pengeluaran = docsCache.filter(d=>d.tipe==='pengeluaran').reduce((a,b)=>a+Number(b.nominal||0),0);
  document.getElementById('total-uang').textContent = `Rp${(pemasukan-pengeluaran).toLocaleString()}`;
  document.getElementById('total-pemasukan').textContent = `Rp${pemasukan.toLocaleString()}`;
  document.getElementById('total-pengeluaran').textContent = `Rp${pengeluaran.toLocaleString()}`;
}

window.openEditById = async function(id){
  editId = id;
  const doc = docsCache.find(d=>d.id===id);
  if(!doc) return;
  document.getElementById('edit-tipe').value = doc.tipe;
  document.getElementById('edit-nominal').value = doc.nominal;
  document.getElementById('modal-edit').style.display = 'flex';
}

window.closeEdit = function(){ document.getElementById('modal-edit').style.display='none'; }

window.submitEdit = async function(){
  const tipe = document.getElementById('edit-tipe').value;
  const nominal = parseInt(document.getElementById('edit-nominal').value,10);
  if(!nominal||nominal<=0) return;
  const user = auth.currentUser; if(!user) return alert('Belum login');
  await entriesRef(user.uid).doc(editId).update({ tipe, nominal });
  editId = null; window.closeEdit();
}

window.openDeleteById = function(id){ deleteId = id; document.getElementById('modal-hapus').style.display='flex'; }

window.confirmDelete = async function(yes){ document.getElementById('modal-hapus').style.display='none'; if(!yes||!deleteId)return; const user = auth.currentUser; if(!user) return; await entriesRef(user.uid).doc(deleteId).delete(); deleteId=null; }
