PGDMP     $    .                z            banco    13.6    13.6     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    25159    banco    DATABASE     a   CREATE DATABASE banco WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'Spanish_Spain.1252';
    DROP DATABASE banco;
                postgres    false            �          0    25162    cuentas 
   TABLE DATA           ,   COPY public.cuentas (id, saldo) FROM stdin;
    public          postgres    false    201   {       �          0    25172    transacciones 
   TABLE DATA           J   COPY public.transacciones (descripcion, fecha, monto, cuenta) FROM stdin;
    public          postgres    false    202   �       �           0    0    cuentas_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.cuentas_id_seq', 17, true);
          public          postgres    false    200            �   5   x�3�42 .NKscC.cNCK#KKK.SNCS����6
�db���� 	      �   �   x�͐=�0F��� �ԝct��LDN����X4]���g����\�wW�
��ԡFT��Q��ߩ�TeTbD	0��3�1vq�\ӧd�`�lJ�f�H:�2�oC�����5
$��ސe�&OR�?#ԫ����e�Z x a��     