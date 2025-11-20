create database sistema_gerencial_fullstack;
use sistema_gerencial_fullstack;

create table login(
    id int primary key auto_increment,
    nome varchar(255) not null,    
    login varchar(64) not null,
    senha varchar(16) not null,
    perfil varchar(5) not null,
    active boolean not null default true
);

insert into login(nome, login, senha, perfil) values('Master User', 'admin', 'admin', 1);