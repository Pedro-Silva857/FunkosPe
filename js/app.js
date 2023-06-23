const url = 'https://raw.githubusercontent.com/Tykitiky/Entrega.03/main/Info/productos.json';
const containerProductos = document.getElementById('containerProducts');
const modal = document.getElementById('ventana-modal');
const carrito = document.getElementById('carrito');
const totalCarrito = document.getElementById('total');
const btnClose = document.getElementsByClassName('close')[0];
const containerCart = document.querySelector('.modal-body');
const pagar = document.querySelector('#pagar-compra')
const vaciarCarrito = document.querySelector('#vaciar-carrito')
const iconMenu = document.getElementById('icon-menu');
const contenedorProductos = document.querySelector('.contenedor-carrito');
const cantidadProductos = document.querySelector('.count-products');
const inputFiltrar = document.querySelector('#input-filtro');
const btnFiltro = document.querySelector('#filtro');
let productosCarrito = [];

const toast = Swal.mixin({
   toast: true,
   position: 'top-end',
   showConfirmButton: false,
   width: 250,
   color: 'black',
   timer: 1500,
   timerProgressBar: true,
});

class Producto {
   constructor (imagen,nombre,precio,id) {
      this.imagen   = imagen;
      this.nombre   = nombre;
      this.precio   = precio;
      this.id       = id;
      this.cantidad = 1;
      this.subtotal = 0;
   }

   obtenerTotal() {
      this.subtotal = this.precio * this.cantidad;
   }
}

cargarEventos();

function cargarEventos() {
   iconMenu.addEventListener('click', showMenu);
   document.addEventListener('DOMContentLoaded',() => {
       renderizarProductos();
       cargarCarritoLocalStorage();
       mostrarProductosCarrito();
   });
   
   
   containerProducts.addEventListener('click', agregarProducto);
   containerCart.addEventListener('click', eliminarProducto);
   pagar.addEventListener('click', pagoFinalizado);
   vaciarCarrito.addEventListener('click', limpiarCarrito);
   btnFiltro.addEventListener('click', filtrarProductos);


   carrito.onclick = function() {
      modal.style.display = 'block';
   };

   btnClose.onclick = function(){
      modal.style.display = 'none';
   };

   window.onclick = function(event){
      if (event.target == modal){
          modal.style.display = 'none';
      }
   }

}

async function filtrarProductos(){
   const productos = await realizarPeticion(url);
   let productoFiltro, filtro;

   filtro = inputFiltrar.value.toLowerCase();
   productoFiltro = productos.filter((producto) => producto.nombre.toLowerCase().includes(filtro));
   if (productoFiltro.length > 0) {
   limpiarFiltro();
   recorrerArray(productoFiltro);
   }else {
      Swal.fire ({
         icon: 'error',
         title: 'Filtrando productos',
         text: 'No se encontraron productos para este filtro',
         timerProgressBar: true,
         timer: 3000,
     })
   }
};

function limpiarFiltro() {
      while (containerProducts.firstChild){
         containerProducts.removeChild(containerProducts.firstChild);
      }
   };

function ocultarModal() {
   modal.style.display = 'none';
}

function cargarCarritoLocalStorage() {
   productosCarrito = JSON.parse(localStorage.getItem('productosLS')) || [];
}

function pagoFinalizado(e){
   if (e.target.classList.contains('boton-pagar')){
   eliminarCarritoLS();
   cargarCarritoLocalStorage();
   mostrarProductosCarrito();
   ocultarModal();
   }
   Swal.fire({
      icon: 'succes',
      title: 'Compra finalizada',
      text: 'Compra exitosa',
      timerProgressBar: true,
      timer:3000,
   });
}

function limpiarCarrito(e){
   if (e.target.classList.contains('boton-pagar')){
      
      }
      Swal.fire({
         title: 'Limpiar carrito',
         text: '¿Desea vaciar el carrito de compras?',
         icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Aceptar',
         cancelButtonText: 'Cancelar',
      }).then((btnResponse)=> {
         if (btnResponse.isConfirmed){
            Swal.fire({
               title: 'Limpiando Carrito..',
               icon: 'success',
               text: 'Su carrito fue vaciado correctamete',
               timerProgressBar: true,
               timer: 3000,
           });
           eliminarCarritoLS();
           cargarCarritoLocalStorage();
           mostrarProductosCarrito();
           ocultarModal();
         }else {
            Swal.fire({
               title: 'Operacion cancelada',
               icon: 'info',
               text: 'Su carrito no fue vaciado',
               timerProgressBar: true,
               timer: 3000,
            });
         }
      })
}

function eliminarCarritoLS() {
   localStorage.removeItem('productosLS');
}


function eliminarProducto(e){
     if(e.target.classList.contains('eliminar-producto')) {

        const productoId = parseInt(e.target.getAttribute('id'));
        alertProduct('error','Producto eliminado', 'red');
        productosCarrito = productosCarrito.filter((producto) => producto.id !== productoId);
        guardarProductoslocalStorage();
        mostrarProductosCarrito();
     }
}

function agregarProducto(e){
   e.preventDefault();

   if (e.target.classList.contains('agregar-carrito')){
      const productoAgregado = e.target.parentElement;

      alertProduct ('success','Producto agregado', '#35939c')
      leerDatosProducto(productoAgregado);
   }
}

function alertProduct (icono, titulo, colorFondo) {
   toast.fire ({
      icon:icono,
      title:titulo,
      background: colorFondo,
   });
}

function leerDatosProducto(producto){

   const datosProducto = new Producto(
      producto.querySelector('img').src,
      producto.querySelector('h4').textContent,
      Number(producto.querySelector('p').textContent.replace('$','')),
      parseInt(producto.querySelector('a').getAttribute('id'))
   );

   datosProducto.obtenerTotal();
    agregarAlCarrito(datosProducto);

}




function agregarAlCarrito(productoAgregar){

   const existeEnCarrito = productosCarrito.some((producto) => producto.id === productoAgregar.id);

   if (existeEnCarrito) {
      const productos = productosCarrito.map((producto) => {
      if (producto.id === productoAgregar.id){
         producto.cantidad++;
         producto.subtotal = producto.precio * producto.cantidad;

         return producto;
      }else {
         return producto;
      }

     
      });
      productosCarrito = productos;
   }else {
      productosCarrito.push(productoAgregar);
   }
   guardarProductoslocalStorage();
   mostrarProductosCarrito();

}

function mostrarProductosCarrito(){
   limpiarHTML();

   productosCarrito.forEach((producto) => {
      const { imagen, nombre, precio, cantidad, subtotal, id} = producto;

      const div = document.createElement('div');
        div.classList.add('contenedor-producto');
        div.innerHTML = `
			<img src="${imagen}" width="100">
			<P>${nombre}</P>
			<P>$${precio}</P>
			<P>${cantidad}</P>
			<P>$${subtotal}</P>
			<a href="#" class="eliminar-producto" id="${id}"> X </a>
		`;

        containerCart.appendChild(div);
   });
   mostrarCantidadCarrito();
   calcularTotal();
}

function mostrarCantidadCarrito(){
   let contarProductos;
   if (productosCarrito.length > 0) {
      contenedorProductos.style.display = 'flex';
      contenedorProductos.style.alignItem= 'center';
      cantidadProductos.style.display = 'flex';
      contarProductos = productosCarrito.reduce((cantidad, producto)=> cantidad + producto.cantidad, 0 );
      cantidadProductos.innerText = `${contarProductos}`;
   } else {
      contenedorProductos.style.display = 'block';
      cantidadProductos.style.display = 'none';
   }
   
}

function calcularTotal(){
   let total = productosCarrito.reduce((sumaTotal, producto) => sumaTotal + producto.subtotal, 0);

   totalCarrito.innerHTML = `Total a pagar:$ ${total}`;
}

async function realizarPeticion(datos){
   try {
      const respuesta = await fetch(datos);

      if (!respuesta.ok){
         throw new Error(`Error en la petición: ${respuesta.status} ${respuesta.statusText}`);
      }

      const data = await respuesta.json();

      return data;
      } catch (error) {
      alert (error);
   }
}

function limpiarHTML(){
    while(containerCart.firstChild) {
      containerCart.removeChild(containerCart.firstChild);
    }
}

function guardarProductoslocalStorage(){
   localStorage.setItem('productosLS', JSON.stringify(productosCarrito));
}

function recorrerArray(arregloProductos){
   arregloProductos.forEach((producto) => {
   const divCard = document.createElement('div');
   divCard.classList.add('card');
   divCard.innerHTML += `
    <img src="./img/${producto.img}" alt="${producto.nombre}" />
    <h4>${producto.nombre}</h4>
    <p>$${producto.precio}</p>
    <a id=${producto.id} class="boton agregar-carrito" href="#">Agregar</a>
   `;

   containerProducts.appendChild(divCard);
});
}

async function renderizarProductos() {
   const productos = await realizarPeticion(url);
   recorrerArray(productos)
}

function showMenu() {
   let navbar = document.getElementById('myTopnav');

   if (navbar.className === 'topnav') {
       navbar.className += ' responsive';
   } else {
       navbar.className = 'topnav';
   }
}











