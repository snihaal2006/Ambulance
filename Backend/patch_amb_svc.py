    public void updateStatus(String code, AmbulanceStatus status) {
        Ambulance amb = repository.findByAmbulanceCode(code);
        if (amb != null) {
            amb.setStatus(status);
            repository.save(amb);
        }
    }
